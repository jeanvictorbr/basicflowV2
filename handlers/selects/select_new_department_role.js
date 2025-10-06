// Crie em: handlers/selects/select_new_department_role.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'select_new_department_role',
    async execute(interaction) {
        const roleId = interaction.values[0];

        const modal = new ModalBuilder()
            // Passamos o roleId no customId do modal para a próxima etapa
            .setCustomId(`modal_department_details_${roleId}`)
            .setTitle('Detalhes do Departamento');

        const nameInput = new TextInputBuilder().setCustomId('input_name').setLabel("Nome do Departamento").setStyle(TextInputStyle.Short).setPlaceholder("Ex: Suporte Técnico").setRequired(true);
        const descInput = new TextInputBuilder().setCustomId('input_desc').setLabel("Descrição (opcional)").setStyle(TextInputStyle.Short).setPlaceholder("Para problemas com o bot, etc.").setRequired(false);
        const emojiInput = new TextInputBuilder().setCustomId('input_emoji').setLabel("Emoji (opcional)").setStyle(TextInputStyle.Short).setPlaceholder("Ex: 🤖").setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(descInput),
            new ActionRowBuilder().addComponents(emojiInput)
        );

        await interaction.showModal(modal);
    }
};