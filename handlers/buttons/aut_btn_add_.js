// Substitua o conteúdo em: handlers/buttons/aut_btn_add_.js
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'aut_btn_add_',
    async execute(interaction) {
        const annId = interaction.customId.split('_').pop();

        const modal = new ModalBuilder()
            .setCustomId(`aut_btn_add_modal_${annId}`)
            .setTitle('Adicionar Botão');

        const labelInput = new TextInputBuilder()
            .setCustomId('aut_btn_label')
            .setLabel('Texto do Botão (Máx 45 chars)')
            .setPlaceholder('Ex: 💬・Converse-conosco')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            // CORREÇÃO: Limite reduzido para garantir que o payload caiba no customId
            .setMaxLength(45);

        modal.addComponents(new ActionRowBuilder().addComponents(labelInput));
        await interaction.showModal(modal);
    }
};