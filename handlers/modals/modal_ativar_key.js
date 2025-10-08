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
        
        // CORREÇÃO: Obter um cliente do pool de conexões
        const client = await db.getClient();

        try {
            // CORREÇÃO: Iniciar a transação com o cliente
            await client.query('BEGIN');

            for (const feature of featuresToGrant) {
                // Todas as queries dentro da transação devem usar 'client.query'
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

            await client.query('UPDATE activation_keys SET uses_left = uses_left - 1 WHERE key = $1', [key]);
            
            // CORREÇÃO: Finalizar a transação com sucesso
            await client.query('COMMIT');

            await interaction.editReply({
                content: `✅ Licença ativada! As funcionalidades **[${featuresToGrant.join(', ')}]** foram ativadas/estendidas.`
            });

        } catch (error) {
            // CORREÇÃO: Desfazer a transação em caso de erro
            await client.query('ROLLBACK');
            console.error('[ATIVAR KEY] Erro na transação:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao ativar sua chave.' });
        } finally {
            // CORREÇÃO: Liberar o cliente de volta para o pool
            client.release();
        }
    }
};