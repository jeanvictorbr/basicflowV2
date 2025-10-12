// Crie em: handlers/modals/modal_dev_guild_add_feature_.js
const db = require('../../database.js');
const generateDevGuildFeaturesMenu = require('../../ui/devPanel/devGuildFeaturesMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_dev_guild_add_feature_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const [, , , , , guildId, encodedFeatures] = interaction.customId.split('_');
        const features = Buffer.from(encodedFeatures, 'base64').toString('utf8').split(',');
        const days = parseInt(interaction.fields.getTextInputValue('input_days'), 10);

        if (isNaN(days) || days <= 0) {
            return interaction.followUp({ content: 'Por favor, insira um número válido de dias.', ephemeral: true });
        }

        const client = await db.getClient();
        try {
            await client.query('BEGIN');
            const interval = `${days} days`;

            for (const featureKey of features) {
                // Lógica UPSERT: Insere a feature ou atualiza a data de expiração se já existir
                await client.query(`
                    INSERT INTO guild_features (guild_id, feature_key, expires_at, activated_by_key)
                    VALUES ($1, $2, NOW() + $3::interval, 'dev_panel')
                    ON CONFLICT (guild_id, feature_key)
                    DO UPDATE SET expires_at = GREATEST(guild_features.expires_at, NOW()) + $3::interval;
                `, [guildId, featureKey, interval]);
            }
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('[DEV PANEL] Erro ao adicionar features:', error);
            await interaction.followUp({ content: '❌ Ocorreu um erro ao salvar as features.', ephemeral: true });
            return;
        } finally {
            client.release();
        }

        const featuresResult = await db.query('SELECT feature_key, expires_at FROM guild_features WHERE guild_id = $1 AND expires_at > NOW()', [guildId]);
        
        await interaction.editReply({
            components: generateDevGuildFeaturesMenu(guildId, featuresResult.rows),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};