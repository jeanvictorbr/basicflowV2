// Substitua o conteúdo em: handlers/buttons/aut_ann_select_manage_cancel_.js
const db = require('../../database.js');
const buildManageAnnouncementMenu = require('../../ui/automations/manageAnnouncement');
const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_ann_select_manage_cancel_',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        const announcementId = interaction.customId.split('_').pop();

        try {
            const { rows } = await db.query('SELECT * FROM automations_announcements WHERE announcement_id = $1 AND guild_id = $2', [announcementId, interaction.guild.id]);
            
            if (rows.length === 0) {
                 // Payload de erro V2
                return interaction.editReply({
                    type: 17,
                    components: [
                        { type: 10, content: "❌ Este anúncio não foi encontrado." },
                        { type: 14, divider: true, spacing: 2 },
                        { 
                            type: 1, components: [
                                { type: 2, style: 2, label: 'Voltar', emoji: { name: '⬅️' }, custom_id: 'automations_manage_announcements' }
                            ]
                        }
                    ]
                });
            }

            const announcement = rows[0];
            const menu = await buildManageAnnouncementMenu(interaction, announcement);
            
            // --- CORREÇÃO AQUI ---
            await interaction.editReply({ ...menu[0] });

        } catch (err) {
            console.error('Erro ao cancelar deleção:', err);
             // Payload de erro V2
            await interaction.editReply({
                type: 17,
                components: [
                    { type: 10, content: "❌ Ocorreu um erro ao recarregar o menu." },
                    { type: 14, divider: true, spacing: 2 },
                    { 
                        type: 1, components: [
                            { type: 2, style: 2, label: 'Voltar', emoji: { name: '⬅️' }, custom_id: 'automations_manage_announcements' }
                        ]
                    }
                ]
            });
        }
    }
};