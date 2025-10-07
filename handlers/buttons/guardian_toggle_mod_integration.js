// Crie em: handlers/buttons/guardian_toggle_mod_integration.js
const db = require('../../database.js');
const generateGuardianAiMenu = require('../../ui/guardianAiMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'guardian_toggle_mod_integration',
    async execute(interaction) {
        await interaction.deferUpdate();
        await db.query(`UPDATE guild_settings SET guardian_use_mod_punishments = NOT COALESCE(guardian_use_mod_punishments, false) WHERE guild_id = $1`, [interaction.guild.id]);
        
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        await interaction.editReply({
            components: generateGuardianAiMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};