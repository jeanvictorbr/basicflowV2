// Crie em: utils/afkCheck.js
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

            // Simula uma interação para chamar o handler de finalizar ponto
            const guild = await client.guilds.fetch(guildId);
            const member = await guild.members.fetch(userId);
            
            // Envia uma "interação fantasma" para o handler de finalizar serviço
            // Isso garante que toda a lógica de finalização (logs, ranking, etc.) seja executada
            await pontoEndServiceHandler.execute({ 
                user: user, 
                member: member,
                guild: guild,
                client: client,
                // Funções simuladas
                deferReply: () => Promise.resolve(),
                editReply: (options) => user.send(`Seu ponto foi finalizado automaticamente por inatividade. Detalhes: \`${options.content}\``),
             });

        }, 15 * 60 * 1000); // 15 minutos

        client.afkToleranceTimers.set(userId, toleranceTimer);

    } catch (error) {
        console.error(`[AFK Check] Falha ao enviar DM para ${userId}. O usuário pode ter DMs desativadas.`, error);
        // Opcional: registrar essa falha em um canal de logs de admin.
    }
}

function scheduleAfkCheck(client, guildId, userId, intervalMinutes) {
    // Cancela qualquer check antigo antes de agendar um novo
    if (client.afkCheckTimers.has(userId)) {
        clearTimeout(client.afkCheckTimers.get(userId));
    }

    const checkTimer = setTimeout(() => {
        performAfkCheck(client, guildId, userId);
    }, intervalMinutes * 60 * 1000);

    client.afkCheckTimers.set(userId, checkTimer);
}

module.exports = { scheduleAfkCheck };