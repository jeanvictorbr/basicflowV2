// Substitua o conteúdo em: handlers/buttons/store_dm_action_.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'store_dm_action_',
    async execute(interaction) {
        const [, , , action, guildId, cartId] = interaction.customId.split('_');

        const cart = (await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [cartId])).rows[0];
        
        if (!cart) {
            await interaction.reply({ content: '❌ Este carrinho não existe mais ou foi finalizado.', ephemeral: true });
            try { await interaction.message.delete(); } catch(e) {}
            return;
        }

        switch (action) {
            case 'cancel':
                 return interaction.reply({ 
                     content: 'Você tem certeza que deseja cancelar esta compra? Todo o seu progresso será perdido e o canal de atendimento será excluído.',
                     components: [
                         new ActionRowBuilder().addComponents(
                             new ButtonBuilder().setCustomId(`store_dm_cancel_confirm_${guildId}_${cartId}`).setLabel('Sim, Cancelar').setStyle(ButtonStyle.Danger),
                             new ButtonBuilder().setCustomId('delete_ephemeral_reply').setLabel('Não').setStyle(ButtonStyle.Secondary)
                         )
                     ],
                     ephemeral: true
                 });
        }
    }
};