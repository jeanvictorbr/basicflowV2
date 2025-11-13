// Substitua o conteúdo em: handlers/modals/aut_ann_edit_name_modal_.js
const db = require('../../database');
const buildManageAnnouncementMenu = require('../../ui/automations/manageAnnouncement');
const { EPHEMERAL_FLAG, V2_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_ann_edit_name_modal_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const annId = interaction.customId.split('_').pop();
        const newName = interaction.fields.getTextInputValue('aut_ann_name');

        try {
            await db.query('UPDATE automations_announcements SET name = $1 WHERE announcement_id = $2', [newName, annId]);

            const { rows } = await db.query('SELECT * FROM automations_announcements WHERE announcement_id = $1', [annId]);
            
            await interaction.followUp({
                content: '✅ Nome atualizado com sucesso!',
                flags: EPHEMERAL_FLAG
            });

            const menu = await buildManageAnnouncementMenu(interaction, rows[0]);
            await interaction.message.edit({ 
                components: menu[0].components, 
                flags: V2_FLAG 
            }).catch(err => {
                // Adicionado: Tratar erro 10008 (Mensagem deletada)
                if (err.code === 10008) {
                    console.log(`[WARN] Falha ao editar painel V2 (nome): Mensagem original foi deletada.`);
                } else {
                    console.error('Erro ao editar painel V2 (nome):', err);
                }
            });

        } catch (err) {
            console.error('Erro ao editar nome do anúncio:', err);
            await interaction.followUp({
                content: '❌ Ocorreu um erro ao salvar o novo nome.',
                flags: EPHEMERAL_FLAG
            });
        }
    }
};