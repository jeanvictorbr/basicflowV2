// Substitua o conteúdo em: handlers/modals/aut_sch_daily_modal_.js
const db = require('../../database');
const buildManageAnnouncementMenu = require('../../ui/automations/manageAnnouncement');
// CORREÇÃO: Remover 'rescheduleAnnouncement'. Não vamos mais usá-lo aqui.
// const { rescheduleAnnouncement } = require('../../utils/automationsMonitor');
const { EPHEMERAL_FLAG, V2_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_sch_daily_modal_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const annId = interaction.customId.split('_').pop();
        const time = interaction.fields.getTextInputValue('aut_sch_time'); // Ex: "14:30"

        if (!/^\d{2}:\d{2}$/.test(time)) {
            return interaction.followUp({ content: '❌ Formato de hora inválido. Use `HH:MM` (em UTC).', flags: EPHEMERAL_FLAG });
        }
        
        const [hour, minute] = time.split(':');
        
        if (parseInt(hour) > 23 || parseInt(minute) > 59) {
            return interaction.followUp({ content: '❌ Hora inválida. O máximo é `23:59` (em UTC).', flags: EPHEMERAL_FLAG });
        }

        const newCronString = `${parseInt(minute)} ${parseInt(hour)} * * *`;

        // --- LÓGICA DE AGENDAMENTO CORRIGIDA ---
        const now = new Date(); // O servidor está em UTC
        const nextRun = new Date();

        // Define a hora e minuto que o usuário pediu (em UTC)
        nextRun.setUTCHours(parseInt(hour), parseInt(minute), 0, 0);

        // Se a hora que o usuário pediu JÁ PASSOU HOJE...
        // (Adicionamos uma tolerância de 10s para race conditions)
        if (nextRun.getTime() < (now.getTime() - 10000)) {
            // ...agenda para o DIA SEGUINTE.
            nextRun.setUTCDate(nextRun.getUTCDate() + 1);
        }
        // Se a hora ainda não passou, ou está 10s no passado (race condition), 
        // 'nextRun' será agendado para hoje (ou para agora).
        
        const nextRunTimestamp = nextRun.getTime();
        // --- FIM DA LÓGICA ---

        try {
            // CORREÇÃO: Salva a cron string E o timestamp calculado
            await db.query(
                'UPDATE automations_announcements SET cron_string = $1, next_run_timestamp = $2 WHERE announcement_id = $3',
                [newCronString, nextRunTimestamp, annId]
            );
            
            const { rows } = await db.query('SELECT * FROM automations_announcements WHERE announcement_id = $1', [annId]);

            // Não chamamos mais o rescheduleAnnouncement aqui
            
            await interaction.followUp({ content: `✅ Agendado diariamente às ${time} (UTC)!`, flags: EPHEMERAL_FLAG });
            
            const menu = await buildManageAnnouncementMenu(interaction, rows[0]);
            await interaction.message.edit({ 
                components: menu[0].components, 
                flags: V2_FLAG 
            }).catch(err => {
                if (err.code === 10008) console.log(`[WARN] Falha ao editar painel V2 (diário): Mensagem deletada.`);
                else console.error('Erro ao editar painel V2 (diário):', err);
            });

        } catch (err) {
            console.error('Erro ao salvar agendamento diário:', err);
            await interaction.followUp({ content: '❌ Erro ao salvar o agendamento.', flags: EPHEMERAL_FLAG });
        }
    }
};