// handlers/buttons/store_staff_approve_payment.js
const db = require('../../database.js');
const { approvePurchase } = require('../../utils/approvePurchase.js');

module.exports = {
    customId: 'store_staff_approve_payment',
    async execute(interaction) {
        const cartId = interaction.channel.isThread() ? interaction.channel.parentId : interaction.channel.id;
        
        if (!cartId) { return interaction.reply({ content: '❌ Erro: Não foi possível identificar o carrinho.', ephemeral: true }); }

        const cart = (await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [cartId])).rows[0];
        if (!cart) { return interaction.reply({ content: '❌ Este carrinho não foi encontrado.', ephemeral: true }); }
        
        const settings = (await db.query('SELECT store_staff_role_id FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        if (!interaction.member.roles.cache.has(settings.store_staff_role_id)) {
            return interaction.reply({ content: '❌ Você não tem permissão para aprovar pagamentos.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const result = await approvePurchase(interaction.client, interaction.guild.id, cartId);

        if (result.success) {
            await interaction.editReply(`✅ ${result.message} O canal será excluído em breve.`);
        } else {
            await interaction.editReply(`❌ Falha ao aprovar a compra: ${result.message}`);
        }
    }
};