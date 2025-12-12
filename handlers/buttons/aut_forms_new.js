const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'aut_forms_new',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('aut_forms_new_sub')
            .setTitle('Novo Formulário');

        const idInput = new TextInputBuilder()
            .setCustomId('id')
            .setLabel("ID Único (ex: staff, denuncia)")
            .setPlaceholder("Sem espaços, use _")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(20)
            .setRequired(true);

        const titleInput = new TextInputBuilder()
            .setCustomId('title')
            .setLabel("Título do Formulário")
            .setPlaceholder("Ex: Recrutamento de Moderadores")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(100)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(idInput),
            new ActionRowBuilder().addComponents(titleInput)
        );

        await interaction.showModal(modal);
    }
};