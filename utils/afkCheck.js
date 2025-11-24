// utils/afkCheck.js
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
            client.afkToleranceTimers.delete(userId);

            const guild = await client.guilds.fetch(guildId).catch(() => null);
            const member = await guild?.members.fetch(userId).catch(() => null);
            
            if (guild && member) {
                // CRIAÇÃO DA INTERAÇÃO SIMULADA ROBUSTA
                const fakeInteraction = {
                    user: user,
                    member: member,
                    guild: guild,
                    client: client,
                    id: 'simulated_afk_timeout',
                    customId: 'ponto_end_service',
                    deferred: true, // IMPORTANTE: Marca como já deferido para pular o await interaction.deferUpdate()
                    replied: true,
                    
                    // Funções simuladas para evitar crash
                    deferUpdate: async () => Promise.resolve(),
                    deferReply: async () => Promise.resolve(),
                    editReply: async (options) => {
                        // Tenta enviar DM informando o usuário
                        try {
                            const content = typeof options === 'string' ? options : options.content;
                            await user.send(`⚠️ **Aviso:** Seu ponto foi finalizado automaticamente por inatividade.\n${content || ''}`);
                        } catch (e) {
                            console.error('Falha ao enviar DM de finalização AFK:', e);
                        }
                    },
                    followUp: async () => Promise.resolve(),
                    reply: async () => Promise.resolve()
                };

                try {
                    await pontoEndServiceHandler.execute(fakeInteraction);
                } catch (handlerError) {
                    console.error('[AFK Check] Erro ao executar handler de finalização:', handlerError);
                }
            }

        }, 10 * 60 * 1000); // 15 minutos

        client.afkToleranceTimers.set(userId, toleranceTimer);

    } catch (error) {
        console.error(`[AFK Check] Falha ao processar check para ${userId}:`, error);
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