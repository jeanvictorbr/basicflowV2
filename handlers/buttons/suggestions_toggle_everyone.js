// Crie este novo arquivo em: handlers/buttons/suggestions_toggle_everyone.js
const db = require('../../database.js');
const generateSuggestionsMenu = require('../../ui/suggestionsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'suggestions_toggle_everyone',
    async execute(interaction) {
        await interaction.deferUpdate();
        await db.query(`UPDATE guild_settings SET suggestions_mention_everyone = NOT COALESCE(suggestions_mention_everyone, false) WHERE guild_id = $1`, [interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        await interaction.editReply({
            components: generateSuggestionsMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};