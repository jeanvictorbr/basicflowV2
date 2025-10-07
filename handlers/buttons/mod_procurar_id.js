// Crie em: handlers/buttons/mod_procurar_id.js
// (Este é o antigo 'mod_procurar_membro.js', agora com um novo nome e customId)
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'mod_procurar_id',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_mod_procurar_membro')
            .setTitle('Procurar Dossiê por ID');

        const memberInput = new TextInputBuilder()
            .setCustomId('input_member')
            .setLabel("ID do membro")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: 123456789012345678')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(memberInput));
        await interaction.showModal(modal);
    }
};