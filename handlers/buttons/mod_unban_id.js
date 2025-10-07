// Crie em: handlers/buttons/mod_unban_id.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'mod_unban_id',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_mod_unban_id')
            .setTitle('Revogar Banimento por ID');

        const userIdInput = new TextInputBuilder()
            .setCustomId('input_user_id')
            .setLabel("ID do usuário a ser desbanido")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Cole aqui o ID do usuário...')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(userIdInput));
        await interaction.showModal(modal);
    }
};