// Substitua o conteúdo em: handlers/selects/aut_ann_select_manage.js
const db = require('../../database.js');
const buildManageAnnouncementMenu = require('../../ui/automations/manageAnnouncement');
const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_ann_select_manage',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        const announcementId = interaction.values[0]; 

        try {
            const { rows } = await db.query('SELECT * FROM automations_announcements WHERE announcement_id = $1 AND guild_id = $2', [announcementId, interaction.guild.id]);
            
            if (rows.length === 0) {
                // Payload de erro V2
                return interaction.editReply({
                    type: 17,
                    components: [
                        { type: 10, content: "❌ Este anúncio não foi encontrado. Pode ter sido excluído." },
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
            console.error('Erro ao buscar anúncio para gerenciamento:', err);
             // Payload de erro V2
            await interaction.editReply({
                type: 17,
                components: [
                    { type: 10, content: "❌ Ocorreu um erro ao carregar o menu de gerenciamento." },
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