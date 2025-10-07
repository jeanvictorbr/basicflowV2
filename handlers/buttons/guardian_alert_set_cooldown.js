// Crie em: handlers/buttons/guardian_alert_set_cooldown.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'guardian_alert_set_cooldown',
    async execute(interaction) {
        const settings = (await db.query('SELECT guardian_ai_alert_cooldown_minutes FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const modal = new ModalBuilder().setCustomId('modal_guardian_alert_cooldown').setTitle('Definir Cooldown dos Alertas');
        const input = new TextInputBuilder()
            .setCustomId('input_cooldown')
            .setLabel("Intervalo em minutos (mín. 1)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Padrão: 5')
            .setValue(String(settings?.guardian_ai_alert_cooldown_minutes || '5'))
            .setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};