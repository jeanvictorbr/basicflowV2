// handlers/buttons/dev_guilds_page.js
const db = require('../../database.js');
const generateDevGuildsMenu = require('../../ui/devPanel/devGuildsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_guilds_page_',
    async execute(interaction) {
        const page = parseInt(interaction.customId.split('_')[3], 10);
        if (isNaN(page)) return;

        await interaction.deferUpdate();
        
        const guilds = Array.from(interaction.client.guilds.cache.values());
        const allSettings = (await db.query('SELECT guild_id, enabled_features, premium_expires_at FROM guild_settings')).rows;
        
        await interaction.editReply({
            components: generateDevGuildsMenu(guilds, allSettings, page),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};