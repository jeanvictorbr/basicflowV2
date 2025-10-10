// Substitua o conteúdo em: handlers/buttons/dev_manage_guilds.js
const db = require('../../database.js');
const generateDevGuildsMenu = require('../../ui/devPanel/devGuildsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_manage_guilds',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        const guilds = Array.from(interaction.client.guilds.cache.values());

        // CORREÇÃO: Busca os dados de duas tabelas separadas
        const settingsResult = await db.query('SELECT guild_id, premium_expires_at FROM guild_settings');
        const featuresResult = await db.query('SELECT guild_id, feature_key FROM guild_features WHERE expires_at > NOW()');

        // Combina os dados para a interface
        const allSettings = guilds.map(guild => {
            const setting = settingsResult.rows.find(s => s.guild_id === guild.id) || {};
            const enabled_features = featuresResult.rows
                .filter(feature => feature.guild_id === guild.id)
                .map(feature => feature.feature_key)
                .join(',');
            
            return {
                guild_id: guild.id,
                premium_expires_at: setting.premium_expires_at,
                enabled_features
            };
        });

        await interaction.editReply({
            components: generateDevGuildsMenu(guilds, allSettings, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};