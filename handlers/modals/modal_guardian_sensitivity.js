// handlers/modals/modal_guardian_sensitivity.js
const db = require('../../database.js');
const generateGuardianAiMenu = require('../../ui/guardianAiMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_guardian_sensitivity',
    async execute(interaction) {
        await interaction.deferUpdate();

        const toxicity = parseInt(interaction.fields.getTextInputValue('input_toxicity'), 10);
        const sarcasm = parseInt(interaction.fields.getTextInputValue('input_sarcasm'), 10);
        const attack = parseInt(interaction.fields.getTextInputValue('input_attack'), 10);

        if (isNaN(toxicity) || isNaN(sarcasm) || isNaN(attack)) {
            return interaction.followUp({ content: 'Valores inválidos. Por favor, insira apenas números.', ephemeral: true });
        }

        await db.query(
            `UPDATE guild_settings SET 
                guardian_ai_custom_toxicity = $1, 
                guardian_ai_custom_sarcasm = $2, 
                guardian_ai_custom_attack = $3,
                guardian_ai_sensitivity = 'Personalizado'
             WHERE guild_id = $4`,
            [toxicity, sarcasm, attack, interaction.guild.id]
        );

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        await interaction.editReply({
            components: generateGuardianAiMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};