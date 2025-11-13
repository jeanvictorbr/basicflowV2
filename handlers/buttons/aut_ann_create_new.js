// Substitua o conteúdo em: handlers/buttons/aut_ann_create_new.js
const db = require('../../database');
const buildManageAnnouncementMenu = require('../../ui/automations/manageAnnouncement');
const buildAnnouncementsMenu = require('../../ui/automations/announcementsMenu');
const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_ann_create_new',
    async execute(interaction) {
        await interaction.deferUpdate();
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        try {
            // 1. Criar um "rascunho" de anúncio no banco
            // (Esta query está CORRETA para o schema CORRIGIDO acima)
            const { rows: newAnnRows } = await db.query(
                `INSERT INTO automations_announcements 
                 (guild_id, name, channel_id, cron_string, content_data, content_v2, enabled, created_by) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [
                    guildId,
                    'Novo Anúncio (Não Configurado)',
                    '0', // Placeholder channel_id
                    '0 0 1 1 *', // Placeholder cron_string (Não é nulo)
                    JSON.stringify({ title: 'N/A', message: 'N/A' }), // Placeholder content_data
                    JSON.stringify({ content: 'Rascunho' }), // Placeholder content_v2
                    false, // enabled
                    userId
                ]
            );

            const newAnnouncement = newAnnRows[0];

            // 2. Abrir o menu de gerenciamento para este novo anúncio
            const menu = await buildManageAnnouncementMenu(interaction, newAnnouncement);
            
            await interaction.editReply({ ...menu[0] });

        } catch (err) {
            console.error('Erro ao criar rascunho de anúncio:', err);
            
            // --- INÍCIO DA CORREÇÃO (ERRO 2) ---
            // Ocorreu um erro (provavelmente o Erro 1), então recarregamos o menu anterior
            // e mostramos o erro dentro do formato V2.
            
            const { rows: allAnnouncements } = await db.query('SELECT * FROM automations_announcements WHERE guild_id = $1 ORDER BY name', [guildId]);
            const menu = await buildAnnouncementsMenu(interaction, allAnnouncements);

            // Adiciona a mensagem de erro ao topo do menu V2
            menu[0].components.unshift({
                type: 10,
                content: "❌ Ocorreu um erro ao iniciar a criação do anúncio. (Verifique o schema do DB)"
            });
            menu[0].components.unshift({
                type: 14, divider: true, spacing: 1
            });
            
            await interaction.editReply({ 
                ...menu[0]
            });
            // --- FIM DA CORREÇÃO ---
        }
    }
};