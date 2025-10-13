// Garanta que o conteúdo deste arquivo esteja assim:
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ITEMS_PER_PAGE = 5; 

module.exports = function generateFeatureFlagsMenu(statuses, page = 0) {
    const totalPages = Math.ceil(statuses.length / ITEMS_PER_PAGE);
    const paginatedStatuses = statuses.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    const moduleComponents = paginatedStatuses.length > 0
        ? paginatedStatuses.flatMap(status => {
            const statusEmoji = status.is_enabled ? '🟢' : '🔴';
            const buttonStyle = status.is_enabled ? ButtonStyle.Success : ButtonStyle.Danger;
            const buttonLabel = status.is_enabled ? 'Ativado' : 'Desativado';
            
            return [
                {
                    type: 9,
                    accessory: { type: 2, style: buttonStyle, label: buttonLabel, custom_id: `dev_toggle_module_status_${status.module_name}` },
                    components: [
                        { type: 10, content: `**${status.module_name}**` },
                        { type: 10, content: `> Status: ${statusEmoji}` }
                    ]
                },
                { type: 14, divider: true, spacing: 1 }
            ];
        })
        : [{ type: 10, content: '> Nenhum módulo encontrado para configurar.' }];

    if (moduleComponents.length > 0) {
        moduleComponents.pop();
    }

    const paginationRow = new ActionRowBuilder().addComponents(
        // O customId aqui está correto e irá corresponder ao handler renomeado
        new ButtonBuilder().setCustomId(`dev_ff_page_${page - 1}`).setLabel('Anterior').setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId(`dev_ff_page_${page + 1}`).setLabel('Próxima').setStyle(ButtonStyle.Secondary).setDisabled(page + 1 >= totalPages)
    );

    return [
        {
            "type": 17, "accent_color": 15844367,
            "components": [
                { "type": 10, "content": "## 🚩 Gestor de Feature Flags" },
                { "type": 10, "content": `> Ative ou desative módulos globais em tempo real. Página ${page + 1} de ${totalPages || 1}.` },
                { "type": 14, "divider": true, "spacing": 1 },
                ...moduleComponents,
                { "type": 14, "divider": true, "spacing": 2 },
                totalPages > 1 ? { "type": 1, "components": paginationRow.toJSON().components } : null,
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "devpanel" }
                    ]
                }
            ].filter(Boolean)
        }
    ];
};