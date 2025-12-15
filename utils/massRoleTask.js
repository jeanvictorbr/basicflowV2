// utils/massRoleTask.js
const db = require('../database.js');
const { EmbedBuilder } = require('discord.js');

async function startMassRoleTask(guild, options) {
    console.log(`[MassRole] Iniciando tarefa para ${guild.name} (ID: ${guild.id})`);
    console.log(`[MassRole] Solicitado por: ${options.initiatorId} | Ação: ${options.action}`);

    // Busca o cargo alvo
    const role = guild.roles.cache.get(options.roleId);
    if (!role) {
        console.error(`[MassRole] Erro: Cargo ${options.roleId} não encontrado.`);
        return;
    }

    // Busca TODOS os membros (Força o fetch para garantir que pegue todo mundo)
    // Isso pode demorar em servidores grandes
    const members = await guild.members.fetch(); 
    const memberArray = Array.from(members.values());

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    // Prepara o filtro
    const hasFilter = options.filterRoles && options.filterRoles.length > 0;
    const filterSet = new Set(options.filterRoles || []);

    const delay = ms => new Promise(res => setTimeout(res, ms));

    for (const member of memberArray) {
        if (member.user.bot) continue;

        // 1. Filtro
        if (hasFilter) {
            const hasRequiredRole = member.roles.cache.some(r => filterSet.has(r.id));
            if (!hasRequiredRole) {
                skippedCount++;
                continue; 
            }
        }

        // 2. Execução
        try {
            if (options.action === 'add') {
                if (!member.roles.cache.has(role.id)) {
                    await member.roles.add(role);
                    successCount++;
                    await delay(1000); // 1s delay
                } else {
                    skippedCount++; // Já tem
                }
            } else if (options.action === 'remove') {
                if (member.roles.cache.has(role.id)) {
                    await member.roles.remove(role);
                    successCount++;
                    await delay(1000);
                } else {
                    skippedCount++; // Já não tem
                }
            }
        } catch (error) {
            // Ignora erro de hierarquia ou permissão para não spammar log
            failCount++;
        }
    }

    console.log(`[MassRole] Concluído. Sucesso: ${successCount} | Falhas: ${failCount} | Ignorados: ${skippedCount}`);

    // --- ENVIAR RELATÓRIO NO PV (MÉTODO BLINDADO) ---
    try {
        // Busca o usuário DIRETAMENTE na API do Discord (não no cache do servidor)
        const user = await guild.client.users.fetch(options.initiatorId);
        
        if (user) {
            const dmEmbed = new EmbedBuilder()
                .setTitle('✅ Tarefa em Massa Finalizada')
                .setColor(failCount > 0 ? 'Orange' : 'Green')
                .setDescription(`O processo de **${options.action === 'add' ? 'Adicionar' : 'Remover'} Cargos** foi concluído no servidor **${guild.name}**.`)
                .addFields(
                    { name: '🎯 Cargo', value: role.name, inline: true },
                    { name: '✅ Aplicado', value: `${successCount} membros`, inline: true },
                    { name: '⏭️ Ignorados', value: `${skippedCount} (Filtro/Já possuía)`, inline: true },
                    { name: '❌ Falhas', value: `${failCount} (Permissões/Hierarquia)`, inline: true }
                )
                .setTimestamp();

            await user.send({ embeds: [dmEmbed] });
            console.log(`[MassRole] DM de relatório enviada para ${user.tag}`);
        }
    } catch (e) {
        console.error(`[MassRole] FALHA CRÍTICA AO ENVIAR DM:`, e.message);
    }
}

module.exports = startMassRoleTask;