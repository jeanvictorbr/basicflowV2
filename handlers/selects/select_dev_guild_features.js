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
        const selectedFeatures = interaction.values;

        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            // 1. Limpa TODAS as features existentes para esta guilda.
            // A edição manual define o estado exato, sobrepondo chaves anteriores.
            await client.query('DELETE FROM guild_features WHERE guild_id = $1', [guildId]);

            // 2. Insere as novas features selecionadas com uma validade longa (10 anos).
            if (selectedFeatures.length > 0) {
                const expirationDate = new Date();
                expirationDate.setFullYear(expirationDate.getFullYear() + 10);

                for (const featureKey of selectedFeatures) {
                    await client.query(
                        'INSERT INTO guild_features (guild_id, feature_key, expires_at, activated_by_key) VALUES ($1, $2, $3, $4)',
                        [guildId, featureKey, expirationDate, 'dev_panel']
                    );
                }
            }
            
            await client.query('COMMIT');
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('[DEV PANEL] Erro ao atualizar features manualmente:', error);
            await interaction.followUp({ content: '❌ Ocorreu um erro ao salvar as features no banco de dados.', ephemeral: true });
            return;
        } finally {
            client.release();
        }
        
        // Recarrega o menu de gerenciamento para exibir o estado atualizado
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