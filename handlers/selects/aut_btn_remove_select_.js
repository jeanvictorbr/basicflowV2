// Substitua o conteúdo em: handlers/selects/aut_btn_remove_select_.js
const db = require('../../database');
const buildManageButtonsMenu = require('../../ui/automations/manageButtonsMenu');
const buildAnnouncementV2 = require('../../ui/automations/announcementBuilder');
const { EPHEMERAL_FLAG, V2_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_btn_remove_select_',
    async execute(interaction) {
        await interaction.deferUpdate(); // Defer da V2
        
        const annId = interaction.customId.split('_').pop();
        const buttonIndex = parseInt(interaction.values[0]); 

        try {
            const { rows } = await db.query('SELECT * FROM automations_announcements WHERE announcement_id = $1', [annId]);
            if (rows.length === 0) throw new Error('Anúncio não encontrado');
            
            const announcement = rows[0];
            const contentData = announcement.content_data || { buttons: [] };
            
            if (!contentData.buttons || !contentData.buttons[buttonIndex]) {
                throw new Error('Botão não encontrado ou já removido.');
            }

            const removedButton = contentData.buttons.splice(buttonIndex, 1);
            const v2Payload = buildAnnouncementV2(interaction, contentData);

            await db.query(
                'UPDATE automations_announcements SET content_data = $1, content_v2 = $2 WHERE announcement_id = $3',
                [JSON.stringify(contentData), JSON.stringify(v2Payload), annId]
            );

            // Atualiza o painel de gerenciamento de botões
            const menu = await buildManageButtonsMenu(interaction, { ...announcement, content_data: contentData });
            
            // CORREÇÃO: Atualiza a resposta V2 efêmera com editReply
            await interaction.editReply({ 
                components: menu[0].components, 
                flags: V2_FLAG | EPHEMERAL_FLAG 
            });

            await interaction.followUp({ content: `✅ Botão "${removedButton[0].label}" removido.`, flags: EPHEMERAL_FLAG });

        } catch (err) {
            console.error("Erro ao remover botão de anúncio:", err);
            await interaction.followUp({ content: '❌ Erro ao remover o botão.', flags: EPHEMERAL_FLAG });
        }
    }
};