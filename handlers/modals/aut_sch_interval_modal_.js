// Crie o novo arquivo em: handlers/modals/aut_sch_interval_modal_.js
const db = require('../../database');
const buildManageAnnouncementMenu = require('../../ui/automations/manageAnnouncement');
// Importamos o rescheduleAnnouncement para calcular o próximo envio IMEDIATAMENTE
const { rescheduleAnnouncement } = require('../../utils/automationsMonitor');
const { EPHEMERAL_FLAG, V2_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_sch_interval_modal_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const annId = interaction.customId.split('_').pop();
        const minutesStr = interaction.fields.getTextInputValue('aut_sch_minutes');
        const minutes = parseInt(minutesStr);

        // Validação simples
        if (isNaN(minutes) || minutes < 5) {
            return interaction.followUp({ 
                content: '❌ O intervalo mínimo é de **5 minutos** para evitar spam.', 
                flags: EPHEMERAL_FLAG 
            });
        }
        if (minutes > 59) {
             return interaction.followUp({ 
                content: '❌ Para este modo simples, use apenas valores entre 5 e 59 minutos.\nPara horas exatas (ex: a cada 2 horas), use o modo **Avançado** com `0 */2 * * *`.', 
                flags: EPHEMERAL_FLAG 
            });
        }

        // Gera a string Cron de intervalo
        // */30 * * * * significa "A cada passo de 30 minutos dentro da hora" (ex: :00, :30)
        const newCronString = `*/${minutes} * * * *`;

        try {
            // Salva no banco
            await db.query('UPDATE automations_announcements SET cron_string = $1 WHERE announcement_id = $2', [newCronString, annId]);
            
            const { rows } = await db.query('SELECT * FROM automations_announcements WHERE announcement_id = $1', [annId]);
            const announcement = rows[0];

            // Calcula o 'next_run_timestamp' baseado na nova cron string
            await rescheduleAnnouncement(announcement);

            await interaction.followUp({ 
                content: `✅ Loop configurado! O anúncio será enviado a cada **${minutes} minutos**.`, 
                flags: EPHEMERAL_FLAG 
            });

            const menu = await buildManageAnnouncementMenu(interaction, announcement);
            await interaction.message.edit({ 
                components: menu[0].components, 
                flags: V2_FLAG 
            }).catch(err => {
                if (err.code === 10008) console.log(`[WARN] Falha ao editar painel V2 (interval): Mensagem deletada.`);
                else console.error('Erro ao editar painel V2 (interval):', err);
            });

        } catch (err) {
            console.error('Erro ao salvar agendamento de intervalo:', err);
            await interaction.followUp({ content: '❌ Erro ao salvar o agendamento.', flags: EPHEMERAL_FLAG });
        }
    }
};