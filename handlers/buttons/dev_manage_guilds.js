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

        // Busca todas as configurações relevantes de uma vez
        const settingsResult = await db.query('SELECT guild_id, premium_expires_at, ponto_status, registros_status, tickets_category, guardian_ai_enabled FROM guild_settings');
        const featuresResult = await db.query('SELECT guild_id, feature_key FROM guild_features WHERE expires_at > NOW()');

        // Busca os donos de todos os servidores em paralelo para mais eficiência
        const ownerPromises = guilds.map(g => g.fetchOwner().then(owner => ({ id: g.id, ownerTag: owner.user.tag })).catch(() => ({ id: g.id, ownerTag: 'N/A' })));
        const owners = await Promise.all(ownerPromises);
        const ownerMap = new Map(owners.map(o => [o.id, o.ownerTag]));

        // Combina todas as informações para a interface
        const allSettings = guilds.map(guild => {
            const setting = settingsResult.rows.find(s => s.guild_id === guild.id) || {};
            const enabled_features = featuresResult.rows
                .filter(feature => feature.guild_id === guild.id)
                .map(feature => feature.feature_key)
                .join(',');
            
            return {
                guild_id: guild.id,
                name: guild.name,
                memberCount: guild.memberCount,
                joinedAt: guild.joinedAt,
                ownerTag: ownerMap.get(guild.id),
                premium_expires_at: setting.premium_expires_at,
                enabled_features,
                // Adiciona o status dos módulos
                ponto_status: setting.ponto_status,
                registros_status: setting.registros_status,
                tickets_configurado: !!setting.tickets_category, // Se a categoria existe, está configurado
                guardian_ai_enabled: setting.guardian_ai_enabled
            };
        });

        await interaction.editReply({
            components: generateDevGuildsMenu(allSettings, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};