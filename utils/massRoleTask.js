// utils/massRoleTask.js
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const SAFE_SLEEP_INTERVAL = 50; // 50ms de pausa por ação
const FETCH_LIMIT = 1000; // Buscar 1000 membros por vez

/**
 * Executa uma tarefa de cargo em massa em segundo plano usando paginação.
 * @param {User} user - O usuário que iniciou a ação (para enviar DM).
 * @param {Guild} guild - O servidor onde a ação está ocorrendo.
 * @param {string} roleId - O ID do cargo a ser gerenciado.
 * @param {'add' | 'remove'} action - A ação a ser executada.
 * @param {'all' | 'no_roles'} filter - O filtro de membros.
 * @param {string} actionDescription - Descrição da ação para o log de DM.
 */
async function runMassRoleTask(user, guild, roleId, action, filter, actionDescription) {
    let role;
    try {
        // 1. Verifica o cargo primeiro
        role = await guild.roles.fetch(roleId);
        if (!role) throw new Error('Cargo não encontrado.');
        if (!role.editable) throw new Error('Cargo não gerenciável (hierarquia).');

    } catch (err) {
        console.error(`[MassRoleTask] Falha ao buscar/validar cargo ${roleId}: ${err.message}`);
        try {
            await user.send(`## ❌ Falha na Tarefa de Cargos\nNão consegui iniciar a tarefa. O cargo <@&${roleId}> não foi encontrado ou está acima do meu cargo no servidor \`${guild.name}\`.`);
        } catch (dmError) { /* ignore */ }
        return;
    }

    let successCount = 0;
    let failCount = 0;
    let totalProcessed = 0;
    let lastId = undefined; // Para paginação

    try {
        // 2. Inicia o loop de paginação
        while (true) {
            const members = await guild.members.list({ limit: FETCH_LIMIT, after: lastId });

            if (members.size === 0) {
                break; // Terminou de buscar todos os membros
            }

            lastId = members.lastKey();

            for (const [memberId, member] of members) {
                totalProcessed++;
                
                // Filtra bots
                if (member.user.bot) continue;

                // Aplica filtro 'no_roles' (size 1 = apenas @everyone)
                if (filter === 'no_roles' && member.roles.cache.size > 1) {
                    continue;
                }

                // 3. Executa a Ação
                try {
                    if (action === 'add' && !member.roles.cache.has(roleId)) {
                        await member.roles.add(roleId);
                        successCount++;
                        await sleep(SAFE_SLEEP_INTERVAL);
                    } else if (action === 'remove' && member.roles.cache.has(roleId)) {
                        await member.roles.remove(roleId);
                        successCount++;
                        await sleep(SAFE_SLEEP_INTERVAL);
                    }
                } catch (err) {
                    console.warn(`[MassRoleTask] Falha ao ${action} cargo ${role.name} para ${member.user.tag}: ${err.message}`);
                    failCount++;
                }
            }
        }
    } catch (err) {
        // Erro principal (provavelmente falta de Intent GUILD_MEMBERS)
        console.error(`[MassRoleTask] Erro fatal durante a paginação de membros: ${err.message}`);
        try {
            await user.send(`## ❌ Falha Grave na Tarefa de Cargos\nOcorreu um erro ao tentar buscar a lista de membros do servidor \`${guild.name}\`.\n\nVerifique se eu realmente possuo a **Intent \`GUILD_MEMBERS\`** ativada no Portal de Desenvolvedores do Discord.`);
        } catch (dmError) { /* ignore */ }
        return;
    }


    // 4. Tarefa concluída, enviar DM
    try {
        const dmPayload = [
            `## ✅ Operação de Cargos em Massa Concluída`,
            `**Servidor:** \`${guild.name}\``,
            `**Ação:** ${actionDescription}`,
            `**Cargo:** ${role.name} (<@&${role.id}>)`,
            `**Total de Membros Processados:** \`${totalProcessed}\``,
            `**Membros Afetados:** \`${successCount}\``,
            `**Falhas:** \`${failCount}\` (Membros que saíram ou com permissões mais altas)`
        ].join('\n');
        
        await user.send(dmPayload);
    } catch (dmError) {
        console.error(`[MassRoleTask] Falha ao enviar DM de conclusão para ${user.tag}.`);
    }
}

module.exports = runMassRoleTask;