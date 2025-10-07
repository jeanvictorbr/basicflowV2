// handlers/modals/modal_guardian_actions.js
const db = require('../../database.js');
const generateGuardianAiMenu = require('../../ui/guardianAiMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_guardian_actions',
    async execute(interaction) {
        await interaction.deferUpdate();
        const message = interaction.fields.getTextInputValue('input_intervention_message');

        await db.query(
            `UPDATE guild_settings SET guardian_ai_intervention_message = $1 WHERE guild_id = $2`,
            [message, interaction.guild.id]
        );

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        await interaction.editReply({
            components: generateGuardianAiMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};