// Crie em: handlers/buttons/mod_adicionar_nota.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'mod_adicionar_nota_', // Handler dinâmico
    async execute(interaction) {
        const targetId = interaction.customId.split('_')[3];

        const modal = new ModalBuilder()
            .setCustomId(`modal_mod_adicionar_nota_${targetId}`)
            .setTitle('Adicionar Nota Interna ao Dossiê');

        const noteInput = new TextInputBuilder()
            .setCustomId('input_note_content')
            .setLabel("Conteúdo da Nota")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Ex: Membro observado por comportamento suspeito durante o evento X.')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(noteInput));
        await interaction.showModal(modal);
    }
};