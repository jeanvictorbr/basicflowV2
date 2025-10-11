const db = require('../../database.js');
const generateSuggestionsMenu = require('../../ui/suggestionsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'open_suggestions_menu',
    async execute(interaction) {
        await interaction.deferUpdate();
        await db.query(`INSERT INTO guild_settings (guild_id) VALUES ($1) ON CONFLICT (guild_id) DO NOTHING`, [interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        await interaction.editReply({
            components: generateSuggestionsMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};