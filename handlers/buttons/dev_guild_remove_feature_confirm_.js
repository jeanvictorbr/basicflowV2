// Crie em: handlers/buttons/dev_guild_remove_feature_confirm_.js
const db = require('../../database.js');
const generateDevGuildFeaturesMenu = require('../../ui/devPanel/devGuildFeaturesMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_guild_remove_feature_confirm_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const [, , , , , , guildId, featureKey] = interaction.customId.split('_');

        await db.query('DELETE FROM guild_features WHERE guild_id = $1 AND feature_key = $2', [guildId, featureKey]);

        const featuresResult = await db.query('SELECT feature_key, expires_at FROM guild_features WHERE guild_id = $1 AND expires_at > NOW()', [guildId]);
        
        await interaction.editReply({
            components: generateDevGuildFeaturesMenu(guildId, featuresResult.rows),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });

        await interaction.followUp({ content: `✅ Feature **${featureKey}** removida com sucesso!`, ephemeral: true });
    }
};