// Substitua o conteúdo em: handlers/buttons/aut_ann_back_to_manage_.js
const db = require('../../database');
const buildManageAnnouncementMenu = require('../../ui/automations/manageAnnouncement');
const { EPHEMERAL_FLAG, V2_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_ann_back_to_manage_',
    async execute(interaction) {
        await interaction.deferUpdate(); // Defer da V2
        const annId = interaction.customId.split('_').pop();

        const { rows } = await db.query('SELECT * FROM automations_announcements WHERE announcement_id = $1', [annId]);
        if (rows.length === 0) {
            return interaction.followUp({ content: '❌ Este anúncio não foi encontrado.', flags: EPHEMERAL_FLAG });
        }

        const menu = await buildManageAnnouncementMenu(interaction, rows[0]);

        // CORREÇÃO: Atualiza a resposta V2 efêmera com editReply
        await interaction.editReply({ 
            components: menu[0].components, 
            flags: V2_FLAG | EPHEMERAL_FLAG 
        });
    }
};