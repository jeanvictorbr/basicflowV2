// Crie em: handlers/modals/modal_guardian_alert_thresholds.js
const db = require('../../database.js');
const generateGuardianAlertsHubMenu = require('../../ui/guardianAlertsHubMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_guardian_alert_thresholds',
    async execute(interaction) {
        const toxicity = parseInt(interaction.fields.getTextInputValue('input_toxicity'), 10);
        const sarcasm = parseInt(interaction.fields.getTextInputValue('input_sarcasm'), 10);
        const attack = parseInt(interaction.fields.getTextInputValue('input_attack'), 10);

        if (isNaN(toxicity) || isNaN(sarcasm) || isNaN(attack) || [toxicity, sarcasm, attack].some(v => v < 0 || v > 100)) {
            return interaction.reply({ content: '❌ Valores inválidos. Os limiares devem ser números entre 0 e 100.', ephemeral: true });
        }
        await interaction.deferUpdate();
        await db.query(
            `UPDATE guild_settings SET 
                guardian_ai_alert_toxicity_threshold = $1, 
                guardian_ai_alert_sarcasm_threshold = $2, 
                guardian_ai_alert_attack_threshold = $3
             WHERE guild_id = $4`,
            [toxicity, sarcasm, attack, interaction.guild.id]
        );

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        await interaction.editReply({ components: generateGuardianAlertsHubMenu(settings), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};