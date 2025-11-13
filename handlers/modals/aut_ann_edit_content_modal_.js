// Substitua o conteúdo em: handlers/modals/aut_ann_edit_content_modal_.js
const db = require('../../database');
const buildManageAnnouncementMenu = require('../../ui/automations/manageAnnouncement');
const buildAnnouncementV2 = require('../../ui/automations/announcementBuilder');
const { EPHEMERAL_FLAG, V2_FLAG } = require('../../utils/constants'); 
const { parseColor } = require('../../utils/modUtils');

module.exports = {
    customId: 'aut_ann_edit_content_modal_',
    async execute(interaction) {
        await interaction.deferUpdate(); 
        const annId = interaction.customId.split('_').pop();

        const color = interaction.fields.getTextInputValue('aut_ann_color') || null;
        const imageUrl = interaction.fields.getTextInputValue('aut_ann_image_url') || null;
        
        const { rows: existingData } = await db.query('SELECT * FROM automations_announcements WHERE announcement_id = $1', [annId]);
        const announcement = existingData[0];
        const existingButtons = announcement.content_data?.buttons || [];

        const contentData = {
            title: interaction.fields.getTextInputValue('aut_ann_title'),
            message: interaction.fields.getTextInputValue('aut_ann_message'),
            color: color,
            imageUrl: imageUrl,
            buttons: existingButtons 
        };

        if (color && !parseColor(color)) {
             return interaction.followUp({
                content: `❌ **Cor Inválida!**\nO valor \`${color}\` não é um código HEX válido (ex: #FF0000).`,
                flags: EPHEMERAL_FLAG
            });
        }

        try {
            // Passa 'interaction', 'contentData' e a flag 'mention_everyone' do banco
            const v2Payload = buildAnnouncementV2(interaction, contentData, announcement.mention_everyone);

            await db.query(
                'UPDATE automations_announcements SET content_data = $1, content_v2 = $2 WHERE announcement_id = $3',
                [JSON.stringify(contentData), JSON.stringify(v2Payload), annId]
            );

            const { rows } = await db.query('SELECT * FROM automations_announcements WHERE announcement_id = $1', [annId]);
            
            // Atualiza o painel V2 original
            const menu = await buildManageAnnouncementMenu(interaction, rows[0]);
            await interaction.editReply({ 
                components: menu[0].components, 
                flags: V2_FLAG | EPHEMERAL_FLAG
            });
            
            await interaction.followUp({
                content: '✅ Conteúdo atualizado com sucesso!',
                flags: EPHEMERAL_FLAG
            });

        } catch (err) {
            console.error('Erro ao editar conteúdo do anúncio:', err);
            await interaction.followUp({
                content: '❌ Ocorreu um erro ao salvar o novo conteúdo.',
                flags: EPHEMERAL_FLAG
            });
        }
    }
};