// handlers/selects/select_dev_guild_features.js
const db = require('../../database.js');
const generateDevGuildManageMenu = require('../../ui/devPanel/devGuildManageMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_dev_guild_features_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const guildId = interaction.customId.split('_')[4];
        const features = interaction.values.join(',');

        await db.query('UPDATE guild_settings SET enabled_features = $1 WHERE guild_id = $2', [features, guildId]);
        
        const guild = interaction.client.guilds.cache.get(guildId);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0];

        await interaction.editReply({
            components: generateDevGuildManageMenu(guild, settings),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};