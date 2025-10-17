// Caminho: handlers/modals/modal_ativar_key.js
const db = require('../../database.js');
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_ativar_key',
    async execute(interaction) {
        await interaction.deferReply({ flags: EPHEMERAL_FLAG });
        const key = interaction.fields.getTextInputValue('input_key');

        try {
            const { grants_features, duration_days } = await db.withTransaction(async (client) => { // <-- USA withTransaction
                const keyResult = await client.query('SELECT * FROM activation_keys WHERE key = $1 AND uses_left > 0 FOR UPDATE', [key]);
                if (!keyResult.rows[0]) throw new Error('Chave de ativação inválida ou já utilizada.');
                
                const keyData = keyResult.rows[0];
                const featuresToGrant = keyData.grants_features.split(',').map(f => f.trim());

                for (const feature of featuresToGrant) {
                    await client.query(
                        `INSERT INTO guild_features (guild_id, feature_key, expires_at, activated_by_key) 
                         VALUES ($1, $2, NOW() + INTERVAL '1 day' * $3, $4)
                         ON CONFLICT (guild_id, feature_key) 
                         DO UPDATE SET expires_at = GREATEST(guild_features.expires_at, NOW()) + INTERVAL '1 day' * $3`,
                        [interaction.guild.id, feature, keyData.duration_days, key]
                    );
                }

                await client.query('UPDATE activation_keys SET uses_left = uses_left - 1 WHERE key = $1', [key]);
                return keyData;
            });

            await interaction.editReply({
                content: `✅ Licença ativada! As funcionalidades **[${grants_features}]** foram ativadas/estendidas por ${duration_days} dias.`
            });

        } catch (error) {
            console.error('Erro ao ativar chave:', error);
            await interaction.editReply({ content: `❌ ${error.message}` });
        }
    }
};