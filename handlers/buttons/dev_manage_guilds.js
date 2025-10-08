// handlers/buttons/dev_manage_guilds.js
const db = require('../../database.js');
const generateDevGuildsMenu = require('../../ui/devPanel/devGuildsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_manage_guilds',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        const guilds = Array.from(interaction.client.guilds.cache.values());
        const allSettings = (await db.query('SELECT guild_id, enabled_features, premium_expires_at FROM guild_settings')).rows;

        await interaction.editReply({
            components: generateDevGuildsMenu(guilds, allSettings, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};