// Novo Arquivo: ui/automations/scheduleMenu.js

/**
 * @param {object} announcement O objeto do anúncio vindo do DB
 */
async function buildScheduleMenu(announcement) {
    const annId = announcement.announcement_id;

    const description = `Defina a frequência para o anúncio **${announcement.name}**.\n\nAgendamento Atual: \`${announcement.cron_string === '0 0 1 1 *' ? 'Não definido' : announcement.cron_string}\``;

    const v2_components = [
        {
            type: 10,
            content: "## ⏰ Definir Agendamento"
        },
        {
            type: 10,
            content: description
        },
        { type: 14, divider: true, spacing: 2 },
        { // Linha 1 de botões
            type: 1,
            components: [
                { type: 2, style: 1, label: 'Diariamente', emoji: { name: '📅' }, custom_id: `aut_sch_daily_${annId}` },
                { type: 2, style: 1, label: 'Semanalmente', emoji: { name: '🗓️' }, custom_id: `aut_sch_weekly_${annId}` },
            ]
        },
        { // Linha 2 de botões
            type: 1,
            components: [
                { type: 2, style: 2, label: 'Avançado (Cron)', emoji: { name: '⚙️' }, custom_id: `aut_sch_advanced_${annId}` },
                { type: 2, style: 2, label: 'Voltar', emoji: { name: '⬅️' }, custom_id: `aut_ann_back_to_manage_${annId}` }
            ]
        }
    ];

    return [
        {
            type: 17,
            accent_color: 42751,
            components: v2_components.filter(Boolean)
        }
    ];
}

module.exports = buildScheduleMenu;