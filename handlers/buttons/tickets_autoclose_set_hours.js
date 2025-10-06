// Crie em: handlers/buttons/tickets_autoclose_set_hours.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'tickets_autoclose_set_hours',
    async execute(interaction) {
        const settings = (await db.query('SELECT tickets_autoclose_hours FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const modal = new ModalBuilder()
            .setCustomId('modal_autoclose_set_hours')
            .setTitle('Definir Tempo de Inatividade');
        const hoursInput = new TextInputBuilder()
            .setCustomId('input_hours')
            .setLabel("Fechar tickets inativos após quantas horas?")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Mínimo: 1, Máximo: 720 (30 dias)")
            .setValue(String(settings?.tickets_autoclose_hours || '48'))
            .setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(hoursInput));
        await interaction.showModal(modal);
    }
};