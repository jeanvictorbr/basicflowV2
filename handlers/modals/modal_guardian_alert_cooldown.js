// Crie em: handlers/modals/modal_guardian_alert_cooldown.js
const db = require('../../database.js');
const generateGuardianAlertsHubMenu = require('../../ui/guardianAlertsHubMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_guardian_alert_cooldown',
    async execute(interaction) {
        const cooldown = parseInt(interaction.fields.getTextInputValue('input_cooldown'), 10);
        if (isNaN(cooldown) || cooldown < 1) {
            return interaction.reply({ content: '❌ Valor inválido. O cooldown deve ser um número maior ou igual a 1.', ephemeral: true });
        }
        await interaction.deferUpdate();
        await db.query(`UPDATE guild_settings SET guardian_ai_alert_cooldown_minutes = $1 WHERE guild_id = $2`, [cooldown, interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        await interaction.editReply({ components: generateGuardianAlertsHubMenu(settings), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};