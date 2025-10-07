// Crie em: handlers/buttons/mod_procurar_membro.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'mod_procurar_membro',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_mod_procurar_membro')
            .setTitle('Procurar Dossiê de Membro');

        const memberInput = new TextInputBuilder()
            .setCustomId('input_member')
            .setLabel("ID, menção ou nome do membro")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: @ZePequeno ou 123456789012345678')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(memberInput));
        await interaction.showModal(modal);
    }
};