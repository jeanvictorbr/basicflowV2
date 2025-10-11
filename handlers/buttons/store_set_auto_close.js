// Crie em: handlers/buttons/store_set_auto_close.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'store_set_auto_close',
    async execute(interaction) {
        const settings = (await db.query('SELECT store_auto_close_hours FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const currentHours = settings.store_auto_close_hours || 24;

        const modal = new ModalBuilder()
            .setCustomId('modal_store_set_auto_close')
            .setTitle('Definir Tempo para Auto-Fecho');

        const hoursInput = new TextInputBuilder()
            .setCustomId('input_hours')
            .setLabel("Fechar carrinhos inativos após quantas horas?")
            .setStyle(TextInputStyle.Short)
            .setValue(String(currentHours))
            .setPlaceholder('Ex: 24 (para 1 dia)')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(hoursInput));
        await interaction.showModal(modal);
    }
};