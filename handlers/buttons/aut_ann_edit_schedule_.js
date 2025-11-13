// Substitua o conteúdo em: handlers/buttons/aut_ann_edit_schedule_.js
const { EPHEMERAL_FLAG, V2_FLAG } = require('../../utils/constants');
const db = require('../../database');
const parser = require('cron-parser');

module.exports = {
    customId: 'aut_ann_edit_schedule_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const annId = interaction.customId.split('_').pop();

        // Busca dados atuais para mostrar no texto
        let currentCron = 'Não definido';
        let readableTime = '';
        
        try {
            const { rows } = await db.query('SELECT cron_string FROM automations_announcements WHERE announcement_id = $1', [annId]);
            if (rows.length > 0) {
                const cron = rows[0].cron_string;
                if (cron !== '0 0 1 1 *') {
                    currentCron = cron;
                    try {
                        const interval = parser.parseExpression(cron, { tz: 'Etc/UTC' });
                        const nextRun = interval.next().toDate();
                        // Converte UTC para BRT visualmente
                        const brtDate = new Date(nextRun.getTime() - (3 * 60 * 60 * 1000));
                        const h = brtDate.getUTCHours().toString().padStart(2, '0');
                        const m = brtDate.getUTCMinutes().toString().padStart(2, '0');
                        
                        // Se for um loop (começa com */), mudamos o texto
                        if (cron.startsWith('*/')) {
                             readableTime = `\n🔄 **Modo Loop:** Próximo envio às ${h}:${m} (BRT)`;
                        } else {
                             readableTime = `\n🇧🇷 **Horário Brasil:** ${h}:${m}`;
                        }
                    } catch(e) {}
                }
            }
        } catch (e) {}

        const helpText = `
## ⏰ Configuração de Agendamento

**Dica Importante:**
Para horários fixos (Diário/Semanal), lembre-se de somar **3 horas** ao horário de Brasília.
Para **Loops**, o fuso horário não importa tanto (30 min são 30 min em qualquer lugar).

**Configuração Atual:** \`${currentCron}\`${readableTime}

Selecione o tipo de frequência:
`;

        const v2_components = [
            { type: 10, content: helpText },
            { type: 14, divider: true, spacing: 2 },
            {
                type: 1,
                components: [
                    {
                        type: 2, style: 1, label: 'Diário (Fixo)',
                        emoji: { name: '📅' }, custom_id: `aut_sch_daily_${annId}`
                    },
                    {
                        type: 2, style: 1, label: 'Semanal (Fixo)',
                        emoji: { name: '📆' }, custom_id: `aut_sch_weekly_${annId}`
                    },
                    // --- NOVO BOTAO ---
                    {
                        type: 2, style: 3, label: 'Loop (Intervalo)', // Estilo 3 (Verde) para destacar
                        emoji: { name: '🔄' }, custom_id: `aut_sch_interval_${annId}`
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 2, style: 2, label: 'Avançado (Cron)',
                        emoji: { name: '⚙️' }, custom_id: `aut_sch_advanced_${annId}`
                    }
                ]
            },
            { type: 14, divider: true, spacing: 2 },
            {
                type: 1,
                components: [
                    { type: 2, style: 2, label: 'Voltar', emoji: { name: '⬅️' }, custom_id: `aut_ann_back_to_manage_${annId}` }
                ]
            }
        ];

        await interaction.editReply({ 
            components: v2_components, 
            flags: V2_FLAG | EPHEMERAL_FLAG 
        });
    }
};