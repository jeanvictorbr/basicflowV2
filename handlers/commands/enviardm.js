// Caminho: handlers/commands/enviardm.js
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'enviardm',
    execute: async (interaction) => {

        const modal = new ModalBuilder()
            .setCustomId('modal_enviardm_submit')
            .setTitle('Enviar DM em Massa');

        const messageInput = new TextInputBuilder()
            .setCustomId('message_input')
            .setLabel("Mensagem que você deseja enviar")
            .setPlaceholder("Digite sua mensagem aqui... {user.tag} e {user.mention} serão substituídos.")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(messageInput);

        await interaction.showModal(modal.addComponents(firstActionRow));
    },
};