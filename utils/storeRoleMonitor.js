// Substitua o conteúdo em: utils/storeRoleMonitor.js
const db = require('../database.js');

async function checkExpiredRoles(client) {
    console.log('[Store Roles] Verificando cargos de cliente expirados...');
    try {
        const expiredRoles = (await db.query("SELECT * FROM store_user_roles_expiration WHERE expires_at < NOW()")).rows;

        for (const row of expiredRoles) {
            const guild = await client.guilds.fetch(row.guild_id).catch(() => null);
            if (!guild) {
                console.warn(`[Store Roles] Guild ${row.guild_id} não encontrada para remover cargo expirado.`);
                continue;
            }

            const member = await guild.members.fetch(row.user_id).catch(() => null);
            if (!member) {
                // Se o membro não está no servidor, apenas removemos o registro do DB
                await db.query('DELETE FROM store_user_roles_expiration WHERE id = $1', [row.id]);
                continue;
            }

            const role = await guild.roles.fetch(row.role_id).catch(() => null);
            if (role && member.roles.cache.has(role.id)) {
                await member.roles.remove(role, 'Cargo de cliente expirado.');
                console.log(`[Store Roles] Cargo ${role.name} removido de ${member.user.tag} por expiração.`);
                
                await member.send(`Olá! Seu acesso através do cargo **${role.name}** no servidor **${guild.name}** expirou. Considere fazer uma nova compra para renová-lo!`).catch(() => {
                    console.log(`[Store Roles] Falha ao enviar DM de notificação de expiração para ${member.user.tag}`);
                });
            }

            await db.query('DELETE FROM store_user_roles_expiration WHERE id = $1', [row.id]);
        }
    } catch (error) {
        console.error('[Store Roles] Erro ao verificar cargos expirados:', error);
    }
}

module.exports = { checkExpiredRoles };