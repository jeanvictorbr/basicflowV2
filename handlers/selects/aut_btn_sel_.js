// Substitua o conteúdo em: handlers/selects/aut_btn_sel_.js
const db = require('../../database');
const buildManageButtonsMenu = require('../../ui/automations/manageButtonsMenu');
const buildAnnouncementV2 = require('../../ui/automations/announcementBuilder');
const { EPHEMERAL_FLAG, V2_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_btn_sel_',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        // Tenta limpar a mensagem de seleção para não poluir o chat
        try { await interaction.deleteReply(); } catch (e) {}

        // Desmonta o customId
        const parts = interaction.customId.split('_');
        const annId = parts[3];
        const messageId = parts[4];
        const labelBase64 = parts[5];
        const label = Buffer.from(labelBase64, 'base64').toString('utf-8');
        const channelId = interaction.values[0];

        try {
            const { rows } = await db.query('SELECT * FROM automations_announcements WHERE announcement_id = $1', [annId]);
            if (rows.length === 0) throw new Error('Anúncio não encontrado');
            
            const announcement = rows[0];
            const contentData = announcement.content_data || { buttons: [] };
            contentData.buttons = contentData.buttons || [];

            contentData.buttons.push({
                label: label,
                channel_id: channelId
            });

            // Reconstrói o payload V2 com o novo botão
            const v2Payload = buildAnnouncementV2(interaction, contentData, announcement.mention_everyone);

            await db.query(
                'UPDATE automations_announcements SET content_data = $1, content_v2 = $2 WHERE announcement_id = $3',
                [JSON.stringify(contentData), JSON.stringify(v2Payload), annId]
            );

            const menu = await buildManageButtonsMenu(interaction, { ...announcement, content_data: contentData });

            // --- CORREÇÃO ---
            // Tenta atualizar o painel original, mas silencia o erro 10008 se falhar
            try {
                // Tenta buscar a mensagem (funciona se estiver no cache)
                const v2Message = await interaction.channel.messages.fetch(messageId).catch(() => null);

                if (v2Message) {
                    await v2Message.edit({
                        components: menu[0].components,
                        flags: V2_FLAG // Mantém a flag V2
                    });
                }
            } catch (err) {
                // Ignora erro "Unknown Message" (comum em interações efêmeras profundas)
                if (err.code !== 10008) {
                    console.error('Erro não crítico ao atualizar UI de botões:', err);
                }
            }
            // ----------------

            await interaction.followUp({ 
                content: '✅ Botão adicionado com sucesso!', 
                flags: EPHEMERAL_FLAG 
            });

        } catch (err) {
            console.error("Erro ao adicionar botão:", err);
            await interaction.followUp({ content: '❌ Erro ao salvar.', flags: EPHEMERAL_FLAG });
        }
    }
};