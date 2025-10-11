// Substitua o conteúdo em: ui/store/storeMenu.js
const hasFeature = require('../../utils/featureCheck.js');

module.exports = async function generateStoreMenu(interaction, settings) {
    const isEnabled = settings.store_enabled;
    const statusText = isEnabled ? '✅ Ativada' : '❌ Desativada';
    const toggleButton = isEnabled ? { label: 'Desativar Loja', style: 4 } : { label: 'Ativar Loja', style: 3 };

    const hasStorePremium = await hasFeature(interaction.guild.id, 'STORE_PREMIUM');
    const isConfigured = settings.store_category_id && settings.store_log_channel_id && settings.store_staff_role_id;

    return [
        {
            "type": 17, "accent_color": 15105570,
            "components": [
                { "type": 10, "content": `## 🏪 StoreFlow V3 - Painel de Controle` },
                { "type": 10, "content": `> Status da Loja: **${statusText}**` },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Gerenciar Produtos", "custom_id": "store_manage_products" },
                    "components": [{ "type": 10, "content": `**Catálogo de Produtos**\n> Adicione e edite os itens da sua loja.` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                 {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Gerenciar Cupons", "custom_id": "store_manage_coupons", "disabled": !isEnabled },
                    "components": [{ "type": 10, "content": `**Cupons de Desconto**\n> Crie cupons para suas promoções.` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Configurar", "custom_id": "store_config_main" },
                    "components": [{ "type": 10, "content": `**Configurações Essenciais**\n> Defina a vitrine, logs, categoria e cargos.` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Personalizar", "custom_id": "store_customize_vitrine", "disabled": !hasStorePremium, "emoji": { "name": "🎨" } },
                    "components": [{ "type": 10, "content": `**Aparência da Vitrine (Premium)**\n> Altere cores, imagens e textos da vitrine.` }]
                },
                // --- NOVO BOTÃO DE ANALYTICS ADICIONADO ---
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Analisar", "custom_id": "store_open_analytics", "disabled": !hasStorePremium, "emoji": { "name": "📈" } },
                    "components": [{ "type": 10, "content": `**Dashboard de Vendas (Premium)**\n> Acompanhe o desempenho da sua loja.` }]
                },
                // --- FIM DA ADIÇÃO ---
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": toggleButton.style, "label": toggleButton.label, "custom_id": "store_toggle_system", "disabled": !isConfigured },
                        { "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "main_menu_back" }
                    ]
                }
            ]
        }
    ];
};