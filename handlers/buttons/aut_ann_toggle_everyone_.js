// Crie este arquivo em: handlers/buttons/aut_ann_toggle_everyone_.js
const db = require('../../database');
const buildManageAnnouncementMenu = require('../../ui/automations/manageAnnouncement');
const buildAnnouncementV2 = require('../../ui/automations/announcementBuilder');
const { EPHEMERAL_FLAG, V2_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_ann_toggle_everyone_',
    async execute(interaction) {
        await interaction.deferReply({ flags: EPHEMERAL_FLAG }); // Resposta efêmera
        const annId = interaction.customId.split('_').pop();

        try {
            // 1. Toggle no Banco
            await db.query(
                'UPDATE automations_announcements SET mention_everyone = NOT mention_everyone WHERE announcement_id = $1',
                [annId]
            );

            // 2. Busca dados atualizados para reconstruir o JSON V2
            const { rows } = await db.query('SELECT * FROM automations_announcements WHERE announcement_id = $1', [annId]);
            const announcement = rows[0];
            
            // 3. Reconstrói o payload (para incluir/remover o @everyone do JSON salvo)
            const contentData = announcement.content_data || {};
            const v2Payload = buildAnnouncementV2(interaction, contentData, announcement.mention_everyone);

            await db.query('UPDATE automations_announcements SET content_v2 = $1 WHERE announcement_id = $2', [JSON.stringify(v2Payload), annId]);

            // 4. Atualiza UI
            const status = announcement.mention_everyone ? '🔔 Ativado (@everyone)' : '🔕 Desativado';
            await interaction.editReply({ content: `✅ Menção alterada para: ${status}`, flags: EPHEMERAL_FLAG });

            const menu = await buildManageAnnouncementMenu(interaction, announcement);
            
            // Precisamos pegar a mensagem V2 original para editar
            // Como estamos num fluxo deferReply, o 'interaction.message' aponta para o painel V2 original
            await interaction.message.edit({ 
                components: menu[0].components, 
                flags: V2_FLAG 
            }).catch(() => {}); // Ignora erro se mensagem sumiu

        } catch (err) {
            console.error('Erro ao alterar mention everyone:', err);
            await interaction.editReply({ content: '❌ Erro ao alterar a configuração.', flags: EPHEMERAL_FLAG });
        }
    }
};