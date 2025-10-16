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

        try {
            // CORREÇÃO: Usa withClient para gerenciar a transação
            await db.withClient(async (client) => {
                await client.query('BEGIN');

                const keyResult = await client.query('SELECT * FROM activation_keys WHERE key = $1 AND uses_left > 0 FOR UPDATE', [key]);
                const keyData = keyResult.rows[0];

                if (!keyData) {
                    // Lança um erro para ser pego pelo catch principal e fazer rollback
                    throw new Error('Chave de ativação inválida ou já utilizada.');
                }

                const { grants_features, duration_days } = keyData;
                const featuresToGrant = grants_features.split(',').map(f => f.trim());

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
                
                await client.query('INSERT INTO key_activation_history (key, guild_id, user_id, grants_features, guild_name, user_tag) VALUES ($1, $2, $3, $4, $5, $6)', 
                    [key, interaction.guild.id, interaction.user.id, grants_features, interaction.guild.name, interaction.user.tag]
                );

                await client.query('COMMIT');
            });

            // Se chegou aqui, a transação foi um sucesso
            await interaction.editReply({
                content: `✅ Licença ativada! As funcionalidades foram ativadas/estendidas com sucesso.`
            });

        } catch (error) {
            console.error('Erro ao ativar chave:', error);
            // Verifica a mensagem de erro específica que lançamos
            if (error.message.includes('inválida ou já utilizada')) {
                await interaction.editReply({ content: `❌ ${error.message}` });
            } else {
                await interaction.editReply({ content: '❌ Ocorreu um erro interno ao tentar ativar a chave.' });
            }
        }
    }
};