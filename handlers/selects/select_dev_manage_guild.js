// Substitua o conteúdo em: handlers/selects/select_dev_manage_guild.js
const db = require('../../database.js');
const generateDevGuildManageMenu = require('../../ui/devPanel/devGuildManageMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_dev_manage_guild',
    async execute(interaction) {
        await interaction.deferUpdate();
        const guildId = interaction.values[0];
        
        const guild = interaction.client.guilds.cache.get(guildId);
        if (!guild) {
            return interaction.followUp({ content: 'Guilda não encontrada.', ephemeral: true });
        }

        await db.query('INSERT INTO guild_settings (guild_id) VALUES ($1) ON CONFLICT (guild_id) DO NOTHING', [guildId]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0] || {};
        
        // **CORREÇÃO:** Busca as features e a data de expiração correta da tabela 'guild_features'
        const featuresResult = await db.query('SELECT feature_key FROM guild_features WHERE guild_id = $1 AND expires_at > NOW()', [guildId]);
        const expiryResult = await db.query('SELECT MAX(expires_at) as expires_at FROM guild_features WHERE guild_id = $1 AND expires_at > NOW()', [guildId]);

        settings.enabled_features = featuresResult.rows.map(r => r.feature_key).join(',');
        settings.premium_expires_at = expiryResult.rows[0].expires_at;

        await interaction.editReply({
            components: generateDevGuildManageMenu(guild, settings),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};