// handlers/buttons/dev_guild_edit_features.js
const db = require('../../database.js');
const generateDevGuildFeaturesMenu = require('../../ui/devPanel/devGuildFeaturesMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_guild_edit_features_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const guildId = interaction.customId.split('_')[4];
        
        const featuresResult = await db.query('SELECT feature_key, expires_at FROM guild_features WHERE guild_id = $1 AND expires_at > NOW()', [guildId]);
        const activeFeatures = featuresResult.rows;

        await interaction.editReply({
            components: generateDevGuildFeaturesMenu(guildId, activeFeatures),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};