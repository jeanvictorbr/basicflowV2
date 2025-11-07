// Substitua o conteúdo em: utils/storeRoleMonitor.js
const db = require('../database.js');
const { EmbedBuilder } = require('discord.js'); // Importar o EmbedBuilder

async function checkExpiredRoles(client) {
    console.log('[Store Roles] Verificando cargos de cliente expirados...');
    try {
        // Pega todos os cargos expirados
        const expiredRoles = (await db.query("SELECT * FROM store_user_roles_expiration WHERE expires_at < NOW()")).rows;
        if (expiredRoles.length === 0) return;

        // Pega as configurações de log de todos os servidores de uma vez
        const guildIds = [...new Set(expiredRoles.map(r => r.guild_id))];
        const settingsResult = await db.query('SELECT guild_id, store_log_channel_id FROM guild_settings WHERE guild_id = ANY($1::text[])', [guildIds]);
        const logChannelMap = new Map(settingsResult.rows.map(s => [s.guild_id, s.store_log_channel_id]));

        for (const row of expiredRoles) {
            const guild = await client.guilds.fetch(row.guild_id).catch(() => null);
            if (!guild) {
                await db.query('DELETE FROM store_user_roles_expiration WHERE id = $1', [row.id]);
                continue;
            }

            const member = await guild.members.fetch(row.user_id).catch(() => null);
            const role = await guild.roles.fetch(row.role_id).catch(() => null);

            if (member && role && member.roles.cache.has(role.id)) {
                await member.roles.remove(role, 'Cargo de produto/cliente expirado (StoreFlow).');
                console.log(`[Store Roles] Cargo ${role.name} removido de ${member.user.tag} por expiração.`);
                
                await member.send(`Olá! Seu acesso através do cargo **${role.name}** no servidor **${guild.name}** expirou. Considere fazer uma nova compra para renová-lo!`).catch(() => {});

                // --- INÍCIO DA LÓGICA DE LOG ---
                const logChannelId = logChannelMap.get(guild.id);
                if (logChannelId) {
                    const logChannel = await guild.channels.fetch(logChannelId).catch(() => null);
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setColor('Orange')
                            .setTitle('⌛ Cargo Expirado')
                            .setDescription(`O cargo de ${member} (\`${member.user.tag}\`) expirou e foi removido automaticamente.`)
                            .addFields(
                                { name: 'Cargo Removido', value: `${role} (\`${role.name}\`)` },
                                { name: 'ID do Usuário', value: `\`${member.id}\`` }
                            )
                            .setTimestamp();
                        await logChannel.send({ embeds: [logEmbed] }).catch(err => console.error(`[Store Roles] Falha ao enviar log para ${logChannel.id}:`, err));
                    }
                }
                // --- FIM DA LÓGICA DE LOG ---
            }

            // Deleta o registro de expiração após ser processado
            await db.query('DELETE FROM store_user_roles_expiration WHERE id = $1', [row.id]);
        }
    } catch (error) {
        console.error('[Store Roles] Erro ao verificar cargos expirados:', error);
    }
}

module.exports = { checkExpiredRoles };