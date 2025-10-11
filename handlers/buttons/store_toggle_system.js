// Crie em: handlers/buttons/store_toggle_system.js
const db = require('../../database.js');
const generateStoreMenu = require('../../ui/store/storeMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_toggle_system',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        await db.query(`UPDATE guild_settings SET store_enabled = NOT COALESCE(store_enabled, false) WHERE guild_id = $1`, [interaction.guild.id]);
        
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const menu = await generateStoreMenu(interaction, settings);

        await interaction.editReply({
            components: menu,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};