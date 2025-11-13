// Substitua o conteúdo em: handlers/modals/aut_sch_advanced_modal_.js
const db = require('../../database');
const buildManageAnnouncementMenu = require('../../ui/automations/manageAnnouncement');
const { rescheduleAnnouncement } = require('../../utils/automationsMonitor');
const { EPHEMERAL_FLAG, V2_FLAG } = require('../../utils/constants');

// CORREÇÃO: Trocar 'node-cron' por 'cron-parser'
const parser = require('cron-parser');

module.exports = {
    customId: 'aut_sch_advanced_modal_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const annId = interaction.customId.split('_').pop();
        const newCronString = interaction.fields.getTextInputValue('aut_sch_cron');

        // CORREÇÃO: Mudar o método de validação
        try {
            // Tenta "parsear" a string. Se falhar, vai para o catch.
            parser.parseExpression(newCronString); 
        } catch (err) {
            return interaction.followUp({ content: '❌ Essa Cron String é inválida.', flags: EPHEMERAL_FLAG });
        }
        // FIM DA CORREÇÃO

        try {
            await db.query('UPDATE automations_announcements SET cron_string = $1 WHERE announcement_id = $2', [newCronString, annId]);
            
            const { rows } = await db.query('SELECT * FROM automations_announcements WHERE announcement_id = $1', [annId]);
            const announcement = rows[0];

            await rescheduleAnnouncement(announcement);

            await interaction.followUp({ content: '✅ Agendamento avançado atualizado!', flags: EPHEMERAL_FLAG });

            const menu = await buildManageAnnouncementMenu(interaction, announcement);
            await interaction.message.edit({ 
                components: menu[0].components, 
                flags: V2_FLAG 
            }).catch(err => {
                if (err.code === 10008) console.log(`[WARN] Falha ao editar painel V2 (avançado): Mensagem deletada.`);
                else console.error('Erro ao editar painel V2 (avançado):', err);
            });

        } catch (err) {
            console.error('Erro ao salvar agendamento avançado:', err);
            await interaction.followUp({ content: '❌ Erro ao salvar o agendamento.', flags: EPHEMERAL_FLAG });
        }
    }
};