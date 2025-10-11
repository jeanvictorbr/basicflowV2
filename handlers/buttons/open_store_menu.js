// Crie em: handlers/buttons/open_store_menu.js
const db = require('../../database.js');
const generateStoreMenu = require('../../ui/store/storeMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'open_store_menu',
    async execute(interaction) {
        await interaction.deferUpdate();
        await db.query(`INSERT INTO guild_settings (guild_id) VALUES ($1) ON CONFLICT (guild_id) DO NOTHING`, [interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        const menu = await generateStoreMenu(interaction, settings);

        await interaction.editReply({
            components: menu,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};