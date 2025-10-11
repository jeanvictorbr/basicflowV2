// Crie em: handlers/buttons/dev_guild_toggle_status_.js
const db = require('../../database.js');
const generateDevGuildManageMenu = require('../../ui/devPanel/devGuildManageMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_guild_toggle_status_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const guildId = interaction.customId.split('_')[4];

        await db.query(
            `UPDATE guild_settings SET bot_enabled_in_guild = NOT COALESCE(bot_enabled_in_guild, true) WHERE guild_id = $1`,
            [guildId]
        );
        
        const guild = interaction.client.guilds.cache.get(guildId);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0] || {};
        const featuresResult = await db.query('SELECT feature_key FROM guild_features WHERE guild_id = $1 AND expires_at > NOW()', [guildId]);
        const expiryResult = await db.query('SELECT MAX(expires_at) as expires_at FROM guild_features WHERE guild_id = $1 AND expires_at > NOW()', [guildId]);
        settings.enabled_features = featuresResult.rows.map(r => r.feature_key).join(',');
        settings.premium_expires_at = expiryResult.rows[0]?.expires_at;

        await interaction.editReply({
            components: generateDevGuildManageMenu(guild, settings),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};