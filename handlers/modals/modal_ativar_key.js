// Substitua o conteúdo em: handlers/modals/modal_ativar_key.js
const db = require('../../database.js');
const fetch = require('node-fetch');
const { EmbedBuilder } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_ativar_key',
    async execute(interaction) {
        // A resposta agora usa flags desde o início
        await interaction.deferReply({ flags: EPHEMERAL_FLAG });

        const key = interaction.fields.getTextInputValue('input_key');
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            const keyResult = await client.query('SELECT * FROM activation_keys WHERE key = $1 AND uses_left > 0 FOR UPDATE', [key]);
            const keyData = keyResult.rows[0];

            if (!keyData) {
                await client.query('ROLLBACK');
                return interaction.editReply({ content: '❌ Chave de ativação inválida ou já utilizada.' });
            }

            const { grants_features, duration_days } = keyData;
            const featuresToGrant = grants_features.split(',').map(f => f.trim());

            for (const feature of featuresToGrant) {
                const existingFeature = await client.query(
                    'SELECT * FROM guild_features WHERE guild_id = $1 AND feature_key = $2',
                    [interaction.guild.id, feature]
                );

                if (existingFeature.rows.length > 0) {
                    await client.query(
                        `UPDATE guild_features 
                         SET expires_at = CASE 
                                            WHEN expires_at < NOW() THEN NOW() + INTERVAL '1 day' * $3 
                                            ELSE expires_at + INTERVAL '1 day' * $3 
                                          END 
                         WHERE guild_id = $1 AND feature_key = $2`,
                        [interaction.guild.id, feature, duration_days]
                    );
                } else {
                    await client.query(
                        `INSERT INTO guild_features (guild_id, feature_key, expires_at) 
                         VALUES ($1, $2, NOW() + INTERVAL '1 day' * $3)`,
                        [interaction.guild.id, feature, duration_days]
                    );
                }
            }

            const newUsesLeft = keyData.uses_left - 1;
            await client.query('UPDATE activation_keys SET uses_left = $1 WHERE key = $2', [newUsesLeft, key]);
            
            // CORREÇÃO: A coluna chama-se 'grants_features' e não 'features_granted'.
            await client.query('INSERT INTO activation_key_history (key, guild_id, user_id, grants_features, guild_name, user_tag) VALUES ($1, $2, $3, $4, $5, $6)', 
                [key, interaction.guild.id, interaction.user.id, grants_features, interaction.guild.name, interaction.user.tag]
            );

            await client.query('COMMIT');

            if (process.env.PREMIUM_LOG_WEBHOOK_URL) {
                try {
                    const activationEmbed = new EmbedBuilder()
                        .setColor('Gold')
                        .setTitle('✨ Licença Premium Ativada!')
                        .addFields(
                            { name: 'Servidor', value: `**${interaction.guild.name}**\n\`${interaction.guild.id}\``, inline: true },
                            { name: 'Ativada por', value: `${interaction.user.tag}\n\`${interaction.user.id}\``, inline: true },
                            { name: 'Chave Utilizada', value: `\`${key}\`` },
                            { name: 'Features Liberadas', value: `\`${featuresToGrant.join(', ')}\`` },
                            { name: 'Duração', value: `\`${durationDays} dias\`` }
                        )
                        .setTimestamp();

                    await fetch(process.env.PREMIUM_LOG_WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: 'BasicFlow Vendas',
                            avatar_url: interaction.client.user.displayAvatarURL(),
                            embeds: [activationEmbed]
                        })
                    });
                } catch (webhookError) {
                    console.error('[WEBHOOK] Falha ao enviar notificação de ativação de chave:', webhookError);
                }
            }

            await interaction.editReply({
                content: `✅ Licença ativada! As funcionalidades **[${featuresToGrant.join(', ')}]** foram ativadas/estendidas por ${duration_days} dias.`
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao ativar chave:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro interno ao tentar ativar a chave.' });
        } finally {
            client.release();
        }
    }
};