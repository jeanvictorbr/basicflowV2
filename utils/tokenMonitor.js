// Crie este novo arquivo em: utils/tokenMonitor.js
const db = require('../database.js');
const { EmbedBuilder } = require('discord.js');

const GROQ_DAILY_LIMIT = 500000;
const ALERT_THRESHOLD = 0.6; // 60%

// Variável para garantir que o alerta seja enviado apenas uma vez por dia
let hasAlertedToday = false;

// Função para resetar o status do alerta à meia-noite
function resetDailyAlert() {
    const now = new Date();
    const night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // O próximo dia
        0, 0, 0 // à meia-noite
    );
    const msToMidnight = night.getTime() - now.getTime();

    setTimeout(() => {
        hasAlertedToday = false;
        console.log('[Token Monitor] Status de alerta diário resetado.');
        resetDailyAlert(); // Agenda o próximo reset
    }, msToMidnight);
}

async function checkTokenUsage(client) {
    // Se já alertamos hoje, não faz mais nada
    if (hasAlertedToday) return;

    console.log('[Token Monitor] Verificando uso de tokens da API...');

    try {
        // Verifica se o provedor ativo é o Groq
        const botStatus = (await db.query("SELECT active_ai_provider FROM bot_status WHERE status_key = 'main'")).rows[0];
        if (botStatus?.active_ai_provider !== 'groq') {
            console.log('[Token Monitor] Provedor de IA não é Groq. Verificação ignorada.');
            return;
        }

        // Soma os tokens usados hoje (desde a meia-noite do dia atual)
        const dailyTokenResult = await db.query(
            "SELECT SUM(total_tokens) as total FROM ai_usage_logs WHERE created_at >= NOW()::date"
        );
        const dailyTokenUsage = parseInt(dailyTokenResult.rows[0]?.total || '0', 10);

        const usagePercentage = dailyTokenUsage / GROQ_DAILY_LIMIT;

        if (usagePercentage >= ALERT_THRESHOLD) {
            console.log(`[Token Monitor] ALERTA: Limite de ${ALERT_THRESHOLD * 100}% de tokens atingido! Enviando DM...`);

            // Pega o seu ID de usuário do arquivo .env
            const devUser = await client.users.fetch(process.env.DEV_USER_ID);
            if (devUser) {
                const percentage = (usagePercentage * 100).toFixed(2);
                const progressBarLength = 20;
                const filledBlocks = Math.round(progressBarLength * usagePercentage);
                const emptyBlocks = progressBarLength - filledBlocks;
                const progressBar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

                const alertEmbed = new EmbedBuilder()
                    .setColor('Orange')
                    .setTitle('⚠️ Alerta de Consumo de Tokens - Groq API')
                    .setDescription(`O uso diário de tokens ultrapassou **${ALERT_THRESHOLD * 100}%** do limite gratuito.`)
                    .addFields(
                        { name: 'Uso Atual', value: `\`${dailyTokenUsage.toLocaleString('pt-BR')}\` / \`${GROQ_DAILY_LIMIT.toLocaleString('pt-BR')}\`` },
                        { name: 'Progresso', value: `\`[${progressBar}] ${percentage}%\`` }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Considere trocar o provedor de IA no /devpanel para evitar custos.' });
                
                await devUser.send({ embeds: [alertEmbed] });
            }

            // Marca que já alertamos hoje
            hasAlertedToday = true;
        } else {
            console.log(`[Token Monitor] Uso de tokens em ${(usagePercentage * 100).toFixed(2)}%. Tudo ok.`);
        }

    } catch (error) {
        console.error('[Token Monitor] Erro ao verificar uso de tokens:', error);
    }
}

// Inicia o primeiro reset diário
resetDailyAlert();

module.exports = { checkTokenUsage };