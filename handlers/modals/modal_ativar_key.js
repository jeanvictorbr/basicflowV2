// handlers/modals/modal_ativar_key.js
const db = require('../../database.js');

module.exports = {
    customId: 'modal_ativar_key',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const key = interaction.fields.getTextInputValue('input_key');

        const keyDataResult = await db.query('SELECT * FROM activation_keys WHERE key = $1', [key]);
        const keyData = keyDataResult.rows[0];

        if (!keyData || keyData.uses_left <= 0) {
            return interaction.editReply({ content: '❌ Chave de ativação inválida, expirada ou já utilizada.' });
        }

        const featuresToGrant = keyData.grants_features.split(',');
        const durationDays = keyData.duration_days;
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            for (const feature of featuresToGrant) {
                if (!feature) continue;
                
                const currentFeatureResult = await client.query(
                    'SELECT expires_at FROM guild_features WHERE guild_id = $1 AND feature_key = $2',
                    [interaction.guild.id, feature]
                );
                
                let newExpirationDate = new Date();
                const currentExpiration = currentFeatureResult.rows[0]?.expires_at;

                if (currentExpiration && new Date(currentExpiration) > newExpirationDate) {
                    newExpirationDate = new Date(currentExpiration);
                }
                
                newExpirationDate.setDate(newExpirationDate.getDate() + durationDays);

                await client.query(
                    `INSERT INTO guild_features (guild_id, feature_key, expires_at, activated_by_key)
                     VALUES ($1, $2, $3, $4)
                     ON CONFLICT (guild_id, feature_key)
                     DO UPDATE SET expires_at = $3, activated_by_key = $4`,
                    [interaction.guild.id, feature, newExpirationDate, key]
                );
            }

            // --- LÓGICA DE HISTÓRICO E REMOÇÃO ---
            await client.query(
                `INSERT INTO key_activation_history (key, grants_features, guild_id, guild_name, user_id, user_tag)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [key, keyData.grants_features, interaction.guild.id, interaction.guild.name, interaction.user.id, interaction.user.tag]
            );

            if (keyData.uses_left - 1 <= 0) {
                // Remove a chave se os usos acabaram
                await client.query('DELETE FROM activation_keys WHERE key = $1', [key]);
            } else {
                // Apenas decrementa se ainda houver usos
                await client.query('UPDATE activation_keys SET uses_left = uses_left - 1 WHERE key = $1', [key]);
            }
            
            await client.query('COMMIT');

            await interaction.editReply({
                content: `✅ Licença ativada! As funcionalidades **[${featuresToGrant.join(', ')}]** foram ativadas/estendidas.`
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('[ATIVAR KEY] Erro na transação:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao ativar sua chave.' });
        } finally {
            client.release();
        }
    }
};