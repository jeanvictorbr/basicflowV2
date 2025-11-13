// Substitua o conteúdo em: handlers/buttons/aut_ann_toggle_enabled_.js
const db = require('../../database');
const buildManageAnnouncementMenu = require('../../ui/automations/manageAnnouncement');
const { EPHEMERAL_FLAG, V2_FLAG } = require('../../utils/constants');
const { rescheduleAnnouncement } = require('../../utils/automationsMonitor');

module.exports = {
    customId: 'aut_ann_toggle_enabled_',
    async execute(interaction) {
        // CORREÇÃO: Trocar 'deferUpdate' por 'deferReply'
        // Isso cria uma nova resposta "Pensando..." efêmera,
        // em vez de tentar modificar a mensagem V2 original.
        await interaction.deferReply({ flags: EPHEMERAL_FLAG });
        
        const annId = interaction.customId.split('_').pop();

        try {
            // Inverte o status 'enabled'
            await db.query(
                'UPDATE automations_announcements SET enabled = NOT enabled WHERE announcement_id = $1 AND guild_id = $2',
                [annId, interaction.guild.id]
            );

            const { rows } = await db.query('SELECT * FROM automations_announcements WHERE announcement_id = $1', [annId]);
            const announcement = rows[0];

            // Isso vai calcular ou zerar o 'next_run_timestamp'
            await rescheduleAnnouncement(announcement);

            const status = announcement.enabled ? '🟢 Ativado' : '🔴 Desativado';
            
            // Esta chamada agora edita corretamente a resposta efêmera
            await interaction.editReply({
                content: `✅ Status alterado para: ${status}`,
                flags: EPHEMERAL_FLAG
            });

            // E esta chamada atualiza o painel V2 original
            const menu = await buildManageAnnouncementMenu(interaction, announcement);
            await interaction.message.edit({ 
                components: menu[0].components, 
                flags: V2_FLAG 
            }).catch(err => {
                if (err.code === 10008) console.log(`[WARN] Falha ao editar painel V2 (toggle): Mensagem deletada.`);
                else console.error('Erro ao editar painel V2 (toggle):', err);
            });

        } catch (err) {
            console.error('Erro ao ativar/desativar anúncio:', err);
            
            // Esta chamada também edita corretamente a resposta efêmera
            await interaction.editReply({
                content: '❌ Ocorreu um erro ao alterar o status.',
                flags: EPHEMERAL_FLAG
            });
        }
    }
};