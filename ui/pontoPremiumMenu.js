// Crie em: ui/pontoPremiumMenu.js
module.exports = function generatePontoPremiumMenu(settings) {
    const afkCheck = settings?.ponto_afk_check_enabled ? '`✅ Ativado`' : '`❌ Desativado`';
    const afkInterval = settings?.ponto_afk_check_interval_minutes ? `\`${settings.ponto_afk_check_interval_minutes} minutos\`` : '`Não definido`';
    const footer = settings?.ponto_vitrine_footer ? `\`${settings.ponto_vitrine_footer.substring(0, 50)}...\`` : '`Nenhum`';
    const color = settings?.ponto_vitrine_color ? `\`${settings.ponto_vitrine_color}\`` : '`Padrão`';
    const dashboardV2 = settings?.ponto_dashboard_v2_enabled ? '`✅ V2 Ativado`' : '`V1 Padrão`';

    const afkStatusBtn = settings?.ponto_afk_check_enabled ? { label: 'Desativar Check', style: 4, emoji: '🔕' } : { label: 'Ativar Check', style: 3, emoji: '🔔' };

    return [
        {
            "type": 17, "accent_color": 1376000, "spoiler": false,
            "components": [
                { "type": 10, "content": "## ✨ Configurações Premium - Bate-Ponto" },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": afkStatusBtn.style, "label": afkStatusBtn.label, "emoji": { "name": afkStatusBtn.emoji }, "custom_id": "ponto_toggle_afk_check" },
                    "components": [{ "type": 10, "content": `**Verificação de Inatividade (AFK)**\n> Status: ${afkCheck}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 1, "label": "Definir", "custom_id": "ponto_set_afk_interval" },
                    "components": [{ "type": 10, "content": `**Intervalo do Check AFK**\n> A cada ${afkInterval}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 1, "label": "Editar", "custom_id": "ponto_edit_footer" },
                    "components": [{ "type": 10, "content": `**Rodapé da Vitrine**\n> ${footer}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 1, "label": "Escolher", "custom_id": "ponto_set_color" },
                    "components": [{ "type": 10, "content": `**Cor da Vitrine**\n> Cor: ${color}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 2, "label": "Alternar", "custom_id": "ponto_toggle_dashboard_v2" },
                    "components": [{ "type": 10, "content": `**Estilo do Dashboard Pessoal**\n> Usando: ${dashboardV2}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1,
                    "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "ponto_premium_menu_back" }]
                }
            ]
        }
    ];
};