const db = require('../../database.js');
const generateSuggestionsMenu = require('../../ui/suggestionsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;
module.exports = {
    customId: 'select_suggestions_log_channel',
    async execute(interaction) {
        await interaction.deferUpdate();
        const channelId = interaction.values[0];
        await db.query(`UPDATE guild_settings SET suggestions_log_channel = $1 WHERE guild_id = $2`, [channelId, interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        await interaction.editReply({ components: generateSuggestionsMenu(settings), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};