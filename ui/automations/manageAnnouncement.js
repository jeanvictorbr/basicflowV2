// Substitua o conteúdo em: ui/automations/manageAnnouncement.js
const { EPHEMERAL_FLAG } = require('../../utils/constants');
const parser = require('cron-parser'); // Necessário para traduzir o cron

async function buildManageAnnouncementMenu(interaction, announcement) {
    const guild = interaction.guild;
    let channelName = 'Canal não definido';
    if (announcement.channel_id && announcement.channel_id !== '0') {
        try {
            const channel = await guild.channels.cache.get(announcement.channel_id);
            if (channel) channelName = `#${channel.name}`;
            else channelName = 'Canal deletado';
        } catch (e) { channelName = 'Erro ao buscar canal'; }
    }

    const isEnabled = announcement.enabled;
    const annId = announcement.announcement_id;
    const contentData = announcement.content_data || { title: 'N/A', message: 'N/A', buttons: [] };
    const buttons = contentData.buttons || [];
    
    const isConfigured = (
        announcement.channel_id !== '0' &&
        announcement.cron_string !== '0 0 1 1 *' && 
        contentData.title !== 'N/A'
    );

    // --- TRADUÇÃO DO HORÁRIO ---
    let scheduleDisplay = 'Não definido';
    let scheduleExplanation = '';
    
    if (announcement.cron_string !== '0 0 1 1 *') {
        try {
            // Calcula a próxima execução em UTC
            const interval = parser.parseExpression(announcement.cron_string, { tz: 'Etc/UTC' });
            const nextRunUTC = interval.next().toDate();
            
            // Converte para BRT (UTC-3) manualmente para exibição
            const nextRunBRT = new Date(nextRunUTC.getTime() - (3 * 60 * 60 * 1000));
            
            const hours = nextRunBRT.getUTCHours().toString().padStart(2, '0');
            const minutes = nextRunBRT.getUTCMinutes().toString().padStart(2, '0');
            const weekDay = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][nextRunBRT.getUTCDay()];
            
            scheduleDisplay = `\`${announcement.cron_string}\``;
            scheduleExplanation = `\n🕒 **Horário no Brasil:** Aprox. **${hours}:${minutes}** (${weekDay})`;
        } catch (e) {
            scheduleDisplay = `\`${announcement.cron_string}\` (Inválido)`;
        }
    }
    // ---------------------------

    let description = `**Canal:** ${channelName}\n`;
    description += `**Agendamento:** ${scheduleDisplay}${scheduleExplanation}\n`;
    description += `**Status:** ${isEnabled ? '🟢 Ativado' : '🔴 Desativado'}\n`;
    description += `**Botões:** ${buttons.length} configurado(s)\n`;
    description += `**Menção @everyone:** ${announcement.mention_everyone ? '🔔 Sim' : '🔕 Não'}\n\n`;
    
    if (!isConfigured) {
        description += `⚠️ **Pendente:** Este anúncio não pode ser ativado até que o **Canal**, **Agendamento** e **Conteúdo** sejam definidos.\n\n`;
    }
    
    description += `**Prévia do Conteúdo:**\n`;
    description += `> **Título:** ${contentData.title}\n`;
    description += `> **Mensagem:** ${contentData.message.substring(0, 150)}${contentData.message.length > 150 ? '...' : ''}`;

    const v2_components = [
        { type: 10, content: `## 📝 Gerenciando: ${announcement.name}` },
        { type: 10, content: description },
        { type: 14, divider: true, spacing: 2 },
        { // Action Row 1: Ações Principais
            type: 1,
            components: [
                {
                    type: 2, style: 1, label: 'Pré-visualizar',
                    emoji: { name: '👁️' }, custom_id: `aut_ann_preview_${annId}`,
                    disabled: !isConfigured
                },
                {
                    type: 2, style: isEnabled ? 4 : 3,
                    label: isEnabled ? 'Desativar' : 'Ativar',
                    emoji: { name: isEnabled ? '✖️' : '✔️' },
                    custom_id: `aut_ann_toggle_enabled_${annId}`,
                    disabled: !isConfigured && !isEnabled 
                },
                {
                    type: 2, style: 4, label: 'Deletar',
                    emoji: { name: '🗑️' }, custom_id: `aut_ann_delete_${annId}`
                }
            ]
        },
        { // Action Row 2: Edição
            type: 1,
            components: [
                { type: 2, style: 2, label: 'Nome', emoji: { name: '🏷️' }, custom_id: `aut_ann_edit_name_${annId}` },
                { type: 2, style: 2, label: 'Canal', emoji: { name: '📺' }, custom_id: `aut_ann_edit_channel_${annId}` },
                { type: 2, style: 2, label: 'Agenda', emoji: { name: '⏰' }, custom_id: `aut_ann_edit_schedule_${annId}` },
                { type: 2, style: 2, label: 'Conteúdo', emoji: { name: '📄' }, custom_id: `aut_ann_edit_content_${annId}` },
            ]
        },
        { // Action Row 3: Extras
            type: 1,
            components: [
                { type: 2, style: 2, label: 'Botões', emoji: { name: '🔘' }, custom_id: `aut_ann_manage_buttons_${annId}` },
                // --- NOVO BOTÃO ---
                { 
                    type: 2, style: announcement.mention_everyone ? 3 : 2, 
                    label: '@everyone', 
                    emoji: { name: '📣' }, 
                    custom_id: `aut_ann_toggle_everyone_${annId}` 
                }
            ]
        },
        { type: 14, divider: true, spacing: 2 },
        { 
            type: 1,
            components: [
                { type: 2, style: 2, label: 'Voltar', emoji: { name: '⬅️' }, custom_id: 'automations_manage_announcements' }
            ]
        }
    ];

    return [{ type: 17, accent_color: 42751, components: v2_components.filter(Boolean) }];
}

module.exports = buildManageAnnouncementMenu;