// Substitua o conteúdo em: handlers/buttons/store_staff_claim_cart_.js
const db = require('../../database.js');
const generateStaffCartPanel = require('../../ui/store/staffCartPanel.js');
const { ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'store_staff_claim_cart_',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const cartId = interaction.customId.split('_')[4];

        try {
            // CORREÇÃO: Usa withClient para a transação
            await db.withClient(async (client) => {
                await client.query('BEGIN');
                
                const cartResult = await client.query('SELECT * FROM store_carts WHERE channel_id = $1 FOR UPDATE', [cartId]);
                const cart = cartResult.rows[0];

                if (!cart) throw new Error('Este carrinho não existe mais.');
                if (cart.claimed_by_staff_id) throw new Error(`Este atendimento já foi assumido por <@${cart.claimed_by_staff_id}>.`);
                if (!cart.thread_id) throw new Error('Erro: A thread de atendimento para este carrinho não foi encontrada.');

                const thread = await interaction.guild.channels.fetch(cart.thread_id).catch(() => null);
                if (!thread) throw new Error('A thread de atendimento não foi encontrada ou foi deletada.');

                await thread.members.add(interaction.user.id);
                await client.query('UPDATE store_carts SET claimed_by_staff_id = $1 WHERE channel_id = $2', [interaction.user.id, cartId]);
                
                const customer = await interaction.client.users.fetch(cart.user_id);
                const productsInCart = cart.products_json || [];
                const staffPanel = generateStaffCartPanel(cart, productsInCart, customer);
                await thread.send({ content: `${interaction.user}, você assumiu este atendimento.`, ...staffPanel });

                await customer.send(`🤝 Olá! O nosso atendente **${interaction.user.tag}** já está disponível para te ajudar na sua compra. Responda aqui para falar com ele.`).catch(() => {});

                await client.query('COMMIT');
                
                await interaction.editReply(`✅ Atendimento assumido! Você foi adicionado à sala de atendimento: ${thread}`);
            });

            const row = ActionRowBuilder.from(interaction.message.components[0]);
            const button = row.components.find(c => c.data.custom_id === interaction.customId);
            if (button) {
                button.setDisabled(true).setLabel('Atendimento Assumido');
                await interaction.message.edit({ components: [row] });
            }

        } catch (error) {
            console.error('[Store Claim] Erro ao assumir atendimento:', error);
            await interaction.editReply(`❌ ${error.message || 'Ocorreu um erro crítico ao tentar assumir o atendimento.'}`);
        }
    }
};