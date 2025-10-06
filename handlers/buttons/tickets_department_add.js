// Crie em: handlers/buttons/tickets_department_add.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'tickets_department_add',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_ticket_department_add')
            .setTitle('Adicionar Novo Departamento');

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