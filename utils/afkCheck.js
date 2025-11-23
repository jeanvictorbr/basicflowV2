// Substitua o conteúdo em: utils/afkCheck.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../database.js');
const pontoEndServiceHandler = require('../handlers/buttons/ponto_end_service.js');

async function performAfkCheck(client, guildId, userId) {
    const user = await client.users.fetch(userId).catch(() => null);
    if (!user) return;

    try {
        const checkButton = new ButtonBuilder()
            .setCustomId('ponto_confirm_activity')
            .setLabel('Confirmar Atividade')
            .setStyle(ButtonStyle.Success)
            .setEmoji('👋');
        
        const row = new ActionRowBuilder().addComponents(checkButton);
        
        await user.send({
            content: '**Verificação de Atividade!**\nVocê está em serviço. Por favor, clique no botão abaixo para confirmar que você está ativo. Você tem **15 minutos** para responder.',
            components: [row]
        });

        // Inicia o timer de tolerância
        const toleranceTimer = setTimeout(async () => {
            console.log(`[AFK Check] Usuário ${userId} não respondeu a tempo. Finalizando ponto.`);
            client.afkToleranceTimers.delete(userId); // Limpa o próprio timer

            const guild = await client.guilds.fetch(guildId).catch(() => null);
            if (!guild) return;
            
            const member = await guild.members.fetch(userId).catch(() => null);
            
            // Simula uma interação COMPLETA para o handler de finalizar serviço
            await pontoEndServiceHandler.execute({ 
                user: user, 
                member: member, // Pode ser null se o user saiu
                guild: guild,
                client: client,
                // Propriedades falsas cruciais para evitar o crash
                deferred: true, // Diz ao handler que já foi deferido
                deferUpdate: () => Promise.resolve(), // Função vazia para satisfazer chamada
                editReply: async (options) => {
                    // Redireciona o editReply para uma DM ao usuário
                    try { await user.send(`⚠️ Seu ponto foi finalizado automaticamente por inatividade.\n${options.content || ''}`); } catch (e) {}
                },
                followUp: async (options) => {
                     try { await user.send(`⚠️ ${options.content}`); } catch (e) {}
                }
             });

        }, 15 * 60 * 1000); // 15 minutos

        client.afkToleranceTimers.set(userId, toleranceTimer);

    } catch (error) {
        console.error(`[AFK Check] Falha ao enviar DM para ${userId}. O usuário pode ter DMs desativadas.`, error);
    }
}

function scheduleAfkCheck(client, guildId, userId, intervalMinutes) {
    if (client.afkCheckTimers.has(userId)) {
        clearTimeout(client.afkCheckTimers.get(userId));
    }

    const checkTimer = setTimeout(() => {
        performAfkCheck(client, guildId, userId);
    }, intervalMinutes * 60 * 1000);

    client.afkCheckTimers.set(userId, checkTimer);
}

module.exports = { scheduleAfkCheck };