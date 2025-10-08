// handlers/buttons/open_uniformes_menu.js
const db = require('../../database.js');
const generateUniformesMenu = require('../../ui/uniformesMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'open_uniformes_menu',
    async execute(interaction) {
        await db.query(`INSERT INTO guild_settings (guild_id) VALUES ($1) ON CONFLICT (guild_id) DO NOTHING`, [interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        const menu = await generateUniformesMenu(interaction, settings);

        await interaction.update({
            components: menu,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};