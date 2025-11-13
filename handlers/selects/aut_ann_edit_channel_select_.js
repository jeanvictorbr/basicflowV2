// Substitua o conteúdo em: handlers/selects/aut_ann_edit_channel_select_.js
const db = require('../../database');
const buildManageAnnouncementMenu = require('../../ui/automations/manageAnnouncement');
const { rescheduleAnnouncement } = require('../../utils/automationsMonitor');
const { EPHEMERAL_FLAG, V2_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_ann_edit_channel_select_',
    async execute(interaction) {
        // 1. Coloca a interação em estado de carregamento
        await interaction.deferUpdate();
        
        const annId = interaction.customId.split('_').pop();
        const channelId = interaction.values[0];

        try {
            // Atualiza o banco de dados
            await db.query('UPDATE automations_announcements SET channel_id = $1 WHERE announcement_id = $2', [channelId, annId]);
            
            const { rows } = await db.query('SELECT * FROM automations_announcements WHERE announcement_id = $1', [annId]);
            const announcement = rows[0];

            // Re-agenda (caso o anúncio já estivesse ativo)
            await rescheduleAnnouncement(announcement);

            // 2. Reconstrói o Painel Principal
            const menu = await buildManageAnnouncementMenu(interaction, announcement);

            // 3. Restaura o Painel (Substitui o Select Menu de volta pelo Painel)
            await interaction.editReply({ 
                content: '', // Limpa qualquer texto anterior (como "Selecione o canal...")
                components: menu[0].components, 
                flags: V2_FLAG | EPHEMERAL_FLAG 
            });

            // 4. Envia a confirmação separadamente (como um novo balãozinho)
            await interaction.followUp({ 
                content: `✅ Canal atualizado para <#${channelId}>!`, 
                flags: EPHEMERAL_FLAG 
            });

        } catch (err) {
            console.error('Erro ao salvar canal do anúncio:', err);
            await interaction.followUp({ content: '❌ Erro ao salvar o canal.', flags: EPHEMERAL_FLAG });
        }
    }
};