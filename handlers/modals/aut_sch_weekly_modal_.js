// Substitua o conteúdo em: handlers/modals/aut_sch_weekly_modal_.js
const db = require('../../database');
const buildManageAnnouncementMenu = require('../../ui/automations/manageAnnouncement');
// CORREÇÃO: Remover 'rescheduleAnnouncement'.
// const { rescheduleAnnouncement } = require('../../utils/automationsMonitor');
const { EPHEMERAL_FLAG, V2_FLAG } = require('../../utils/constants');

// Função helper para achar a próxima data do dia da semana (em UTC)
function getNextDayOfWeek(dayOfWeek, hour, minute) {
    const now = new Date(); // UTC
    const resultDate = new Date();
    resultDate.setUTCHours(hour, minute, 0, 0);
    
    const currentDay = now.getUTCDay();
    const daysUntilNext = (dayOfWeek - currentDay + 7) % 7;
    
    resultDate.setUTCDate(now.getUTCDate() + daysUntilNext);

    // Se o dia é hoje (daysUntilNext === 0) E a hora já passou
    // (com tolerância de 10s)
    if (daysUntilNext === 0 && resultDate.getTime() < (now.getTime() - 10000)) {
        resultDate.setUTCDate(resultDate.getUTCDate() + 7); // Pula para a próxima semana
    }
    
    return resultDate.getTime();
}

module.exports = {
    customId: 'aut_sch_weekly_modal_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const annId = interaction.customId.split('_').pop();
        const day = interaction.fields.getTextInputValue('aut_sch_day');
        const time = interaction.fields.getTextInputValue('aut_sch_time');

        const dayNum = parseInt(day);
        if (isNaN(dayNum) || dayNum < 0 || dayNum > 7) { 
            return interaction.followUp({ content: '❌ Dia da semana inválido. Use 0-7 (UTC).', flags: EPHEMERAL_FLAG });
        }

        if (!/^\d{2}:\d{2}$/.test(time)) {
            return interaction.followUp({ content: '❌ Formato de hora inválido. Use `HH:MM` (UTC).', flags: EPHEMERAL_FLAG });
        }
        
        const [hour, minute] = time.split(':');
        if (parseInt(hour) > 23 || parseInt(minute) > 59) {
            return interaction.followUp({ content: '❌ Hora inválida. O máximo é `23:59` (UTC).', flags: EPHEMERAL_FLAG });
        }

        const cronDay = dayNum === 7 ? 0 : dayNum; // 0 e 7 são Domingo
        const newCronString = `${parseInt(minute)} ${parseInt(hour)} * * ${cronDay}`;

        // --- LÓGICA DE AGENDAMENTO CORRIGIDA ---
        const nextRunTimestamp = getNextDayOfWeek(cronDay, parseInt(hour), parseInt(minute));
        // --- FIM DA LÓGICA ---

        try {
            // CORREÇÃO: Salva a cron string E o timestamp calculado
            await db.query(
                'UPDATE automations_announcements SET cron_string = $1, next_run_timestamp = $2 WHERE announcement_id = $3',
                [newCronString, nextRunTimestamp, annId]
            );
            
            const { rows } = await db.query('SELECT * FROM automations_announcements WHERE announcement_id = $1', [annId]);
            const announcement = rows[0]; // Definindo a variável

            // Não chamamos mais o rescheduleAnnouncement aqui

            await interaction.followUp({ content: `✅ Agendado semanalmente (Dia ${dayNum} às ${time} UTC)!`, flags: EPHEMERAL_FLAG });

            const menu = await buildManageAnnouncementMenu(interaction, announcement); // Agora 'announcement' está definida
            await interaction.message.edit({ 
                components: menu[0].components, 
                flags: V2_FLAG 
            }).catch(err => {
                if (err.code === 10008) console.log(`[WARN] Falha ao editar painel V2 (semanal): Mensagem deletada.`);
                else console.error('Erro ao editar painel V2 (semanal):', err);
            });

        } catch (err) {
            console.error('Erro ao salvar agendamento semanal:', err);
            await interaction.followUp({ content: '❌ Erro ao salvar o agendamento.', flags: EPHEMERAL_FLAG });
        }
    }
};