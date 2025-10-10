// Substitua o conteúdo em: handlers/buttons/dev_guilds_page.js
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

        // CORREÇÃO: A lógica completa de busca de dados foi adicionada aqui,
        // garantindo que as informações estejam sempre corretas ao mudar de página.
        const settingsResult = await db.query('SELECT guild_id, premium_expires_at, ponto_status, registros_status, tickets_category, guardian_ai_enabled FROM guild_settings');
        const featuresResult = await db.query('SELECT guild_id, feature_key FROM guild_features WHERE expires_at > NOW()');

        const ownerPromises = guilds.map(g => g.fetchOwner().then(owner => ({ id: g.id, ownerTag: owner.user.tag })).catch(() => ({ id: g.id, ownerTag: 'N/A' })));
        const owners = await Promise.all(ownerPromises);
        const ownerMap = new Map(owners.map(o => [o.id, o.ownerTag]));

        const allGuildData = guilds.map(guild => {
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
                ponto_status: setting.ponto_status,
                registros_status: setting.registros_status,
                tickets_configurado: !!setting.tickets_category,
                guardian_ai_enabled: setting.guardian_ai_enabled
            };
        });
        
        // A chamada para a UI agora está correta, passando os dados processados e o número da página.
        await interaction.editReply({
            components: generateDevGuildsMenu(allGuildData, page),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};