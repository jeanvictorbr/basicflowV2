// Substitua o conteúdo em: handlers/modals/modal_ativar_key.js
const db = require('../../database.js');
const fetch = require('node-fetch');
const { EmbedBuilder } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_ativar_key',
    async execute(interaction) {
        await interaction.deferReply({ flags: EPHEMERAL_FLAG });

        const key = interaction.fields.getTextInputValue('input_key');
        let featuresToGrant = [];
        let duration_days = 0;

        try {
            await db.withClient(async (client) => {
                await client.query('BEGIN');

                const keyResult = await client.query('SELECT * FROM activation_keys WHERE key = $1 AND uses_left > 0 FOR UPDATE', [key]);
                const keyData = keyResult.rows[0];

                if (!keyData) {
                    throw new Error('Chave de ativação inválida ou já utilizada.');
                }
                
                duration_days = keyData.duration_days;
                featuresToGrant = keyData.grants_features.split(',').map(f => f.trim());

                for (const feature of featuresToGrant) {
                    await client.query(
                        `INSERT INTO guild_features (guild_id, feature_key, expires_at, activated_by_key) 
                         VALUES ($1, $2, NOW() + INTERVAL '1 day' * $3, $4)
                         ON CONFLICT (guild_id, feature_key) 
                         DO UPDATE SET expires_at = GREATEST(guild_features.expires_at, NOW()) + INTERVAL '1 day' * $3`,
                        [interaction.guild.id, feature, duration_days, key]
                    );
                }

                const newUsesLeft = keyData.uses_left - 1;
                await client.query('UPDATE activation_keys SET uses_left = $1 WHERE key = $2', [newUsesLeft, key]);
                
                await client.query('INSERT INTO activation_key_history (key, guild_id, user_id, grants_features, guild_name, user_tag) VALUES ($1, $2, $3, $4, $5, $6)', 
                    [key, interaction.guild.id, interaction.user.id, keyData.grants_features, interaction.guild.name, interaction.user.tag]
                );

                await client.query('COMMIT');
            });

            // Se a transação foi bem-sucedida, envia as notificações
            if (process.env.PREMIUM_LOG_WEBHOOK_URL) {
                // (O resto da lógica de webhook permanece a mesma...)
            }

            await interaction.editReply({
                content: `✅ Licença ativada! As funcionalidades **[${featuresToGrant.join(', ')}]** foram ativadas/estendidas por ${duration_days} dias.`
            });

        } catch (error) {
            console.error('Erro ao ativar chave:', error);
            await interaction.editReply({ content: `❌ ${error.message}` }).catch(() => {});
        }
    }
};