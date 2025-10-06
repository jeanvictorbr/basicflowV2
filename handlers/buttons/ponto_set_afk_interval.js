const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'ponto_set_afk_interval',
    async execute(interaction) {
        const settings = (await db.query('SELECT ponto_afk_check_interval_minutes FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const modal = new ModalBuilder().setCustomId('modal_ponto_set_afk_interval').setTitle('Definir Intervalo do Check AFK');
        const intervalInput = new TextInputBuilder()
            .setCustomId('input_interval')
            .setLabel("Intervalo em minutos (mín. 10)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: 60')
            .setValue(String(settings?.ponto_afk_check_interval_minutes || '60'))
            .setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(intervalInput));
        await interaction.showModal(modal);
    }
};