// Crie em: utils/premiumExpiryMonitor.js
const db = require('../database.js');
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

async function checkExpiringFeatures(client) {
    if (!process.env.EXPIRY_ALERT_WEBHOOK_URL) return;

    console.log('[Expiry Monitor] A verificar licenças a expirar...');
    try {
        // Procura por licenças que expiram nos próximos 3 dias
        const expiringSoon = await db.query(
            `SELECT guild_id, STRING_AGG(DISTINCT feature_key, ', ') as features, MAX(expires_at) as expiry_date
             FROM guild_features
             WHERE expires_at BETWEEN NOW() AND NOW() + INTERVAL '3 days'
             GROUP BY guild_id`
        );

        if (expiringSoon.rows.length === 0) {
            console.log('[Expiry Monitor] Nenhuma licença a expirar nos próximos 3 dias.');
            return;
        }

        for (const row of expiringSoon.rows) {
            const guild = await client.guilds.fetch(row.guild_id).catch(() => null);
            if (!guild) continue;

            const owner = await guild.fetchOwner().catch(() => null);

            const expiryEmbed = new EmbedBuilder()
                .setColor('Gold')
                .setTitle('🔔 Alerta de Expiração de Licença')
                .setDescription(`A licença para o servidor **${guild.name}** está prestes a expirar!`)
                .addFields(
                    { name: 'Servidor', value: `**${guild.name}**\n\`${guild.id}\`` },
                    { name: 'Dono', value: owner ? `${owner.user.tag}\n\`${owner.id}\`` : '`Não encontrado`' },
                    { name: 'Features', value: `\`${row.features}\`` },
                    { name: 'Data de Expiração', value: `<t:${Math.floor(new Date(row.expiry_date).getTime() / 1000)}:R>` }
                )
                .setTimestamp();

            await fetch(process.env.EXPIRY_ALERT_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'Koda Licenças',
                    avatar_url: client.user.displayAvatarURL(),
                    embeds: [expiryEmbed]
                }),
            });
        }

    } catch (error) {
        console.error('[Expiry Monitor] Erro ao verificar licenças:', error);
    }
}

module.exports = { checkExpiringFeatures };