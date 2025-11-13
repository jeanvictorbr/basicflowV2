const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'aut_gw_bonus_sel_',
    async execute(interaction) {
        const messageId = interaction.customId.split('_').pop();
        const roleId = interaction.values[0];

        // Abre modal para definir quantidade
        const modal = new ModalBuilder()
            .setCustomId(`aut_gw_bonus_qty_${messageId}_${roleId}`)
            .setTitle('Configurar Bônus');

        const qtyInput = new TextInputBuilder()
            .setCustomId('quantity')
            .setLabel('Entradas Extras (Digite 0 para remover)')
            .setPlaceholder('Ex: 2 (Para dar 2 extras, totalizando 3)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(qtyInput));
        await interaction.showModal(modal);
    }
};