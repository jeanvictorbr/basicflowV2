// Substitua o conteúdo em: handlers/buttons/store_pay_manual.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'store_pay_manual',
    async execute(interaction) {
        await interaction.deferUpdate();

        const cart = (await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        const settings = (await db.query('SELECT store_pix_key FROM guild_settings WHERE guild_id = $1', [cart.guild_id])).rows[0];
        const pixKey = settings?.store_pix_key || "CHAVE PIX NÃO CONFIGURADA";

        const instructionsEmbed = EmbedBuilder.from(interaction.message.embeds[0])
            .setColor('#F1C40F')
            .setTitle('📄 Pagamento Manual via PIX')
            .setDescription('**1.** Realize o pagamento para a chave PIX abaixo.\n**2.** Tire um print do comprovante.\n**3.** Clique no botão "Anexar Comprovante" e envie a imagem aqui no canal.')
            .setFields(
                { name: 'Chave PIX (Copia e Cola)', value: `\`${pixKey}\`` },
                { name: 'Status', value: 'Aguardando comprovante...' }
            );

        // Botões para o usuário
        const userButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`store_attach_receipt`)
                .setLabel('Anexar Comprovante')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📎'),
            new ButtonBuilder()
                .setCustomId(`store_payment_return_to_cart`) 
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('↩️')
        );

        // Botões para a staff (sempre visíveis, mas com permissão verificada no handler)
        const staffButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('store_staff_approve_payment')
                .setLabel('Marcar como Pago (Staff)')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅'),
            new ButtonBuilder()
                .setCustomId('store_staff_deny_payment')
                .setLabel('Cancelar Compra (Staff)')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌')
        );

        await interaction.editReply({ embeds: [instructionsEmbed], components: [userButtons, staffButtons] });
    }
};