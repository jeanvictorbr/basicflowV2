const db = require('../database.js');

/**
 * Gerencia a adição/remoção do cargo de "Em Serviço"
 * @param {Object} client Cliente do Discord
 * @param {string} guildId ID do Servidor
 * @param {string} userId ID do Usuário
 * @param {string} action 'ADD' ou 'REMOVE'
 */
async function managePontoRole(client, guildId, userId, action) {
    try {
        // 1. Busca a configuração do cargo
        const config = await db.query(
            `SELECT ponto_cargo_em_servico FROM guild_settings WHERE guild_id = $1`,
            [guildId]
        );

        if (config.rows.length === 0 || !config.rows[0].ponto_cargo_em_servico) {
            return; // Nenhuma configuração de cargo encontrada
        }

        const roleId = config.rows[0].ponto_cargo_em_servico;
        const guild = await client.guilds.fetch(guildId).catch(() => null);
        if (!guild) return;

        const member = await guild.members.fetch(userId).catch(() => null);
        if (!member) return;

        const role = await guild.roles.fetch(roleId).catch(() => null);
        if (!role) return; // Cargo foi deletado ou bot sem permissão

        // 2. Executa a ação
        if (action === 'ADD') {
            if (!member.roles.cache.has(roleId)) {
                await member.roles.add(role);
                console.log(`[Ponto] Cargo ${role.name} adicionado a ${member.user.tag}`);
            }
        } else if (action === 'REMOVE') {
            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(role);
                console.log(`[Ponto] Cargo ${role.name} removido de ${member.user.tag}`);
            }
        }

    } catch (error) {
        console.error(`[Ponto] Erro ao gerenciar cargo (${action}):`, error);
    }
}

module.exports = { managePontoRole };