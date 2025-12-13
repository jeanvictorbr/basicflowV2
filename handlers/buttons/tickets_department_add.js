// handlers/buttons/tickets_department_add.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'tickets_department_add',
    async execute(interaction) {
        // Cria o Modal de Configuração
        const modal = new ModalBuilder()
            .setCustomId('modal_ticket_department_add') // <--- IMPORTANTE: Este ID chama o próximo passo
            .setTitle('Novo Departamento');

        // Pergunta 1: Nome
        const nameInput = new TextInputBuilder()
            .setCustomId('input_dept_name')
            .setLabel('Nome do Departamento')
            .setPlaceholder('Ex: Suporte Técnico, Denúncias...')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100);

        // Pergunta 2: Descrição
        const descInput = new TextInputBuilder()
            .setCustomId('input_dept_desc')
            .setLabel('Descrição (Aparece no menu)')
            .setPlaceholder('Ex: Canal para resolver problemas técnicos.')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1000);

        // Pergunta 3: Emoji
        const emojiInput = new TextInputBuilder()
            .setCustomId('input_dept_emoji')
            .setLabel('Emoji (Opcional)')
            .setPlaceholder('Ex: 🛠️')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(5);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(descInput),
            new ActionRowBuilder().addComponents(emojiInput)
        );

        await interaction.showModal(modal);
    }
};