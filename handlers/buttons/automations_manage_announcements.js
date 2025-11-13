// Substitua o conteúdo em: handlers/buttons/automations_manage_announcements.js
const db = require('../../database.js');
const buildAnnouncementsMenu = require('../../ui/automations/announcementsMenu');
const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'automations_manage_announcements',
    async execute(interaction) {
        await interaction.deferUpdate();

        try {
            const { rows } = await db.query('SELECT * FROM automations_announcements WHERE guild_id = $1 ORDER BY name', [interaction.guild.id]);
            
            const menu = await buildAnnouncementsMenu(interaction, rows);

            // --- CORREÇÃO AQUI ---
            await interaction.editReply({ ...menu[0] });

        } catch (err) {
            console.error('Erro ao buscar anúncios:', err);
            // Payload de erro V2
            await interaction.editReply({
                type: 17,
                components: [
                    { type: 10, content: "❌ Ocorreu um erro ao carregar o menu de anúncios." },
                    { type: 14, divider: true, spacing: 2 },
                    { 
                        type: 1, components: [
                            { type: 2, style: 2, label: 'Voltar', emoji: { name: '⬅️' }, custom_id: 'open_automations_menu' }
                        ]
                    }
                ]
            });
        }
    }
};