// Substitua o conteúdo em: ui/store/storeMenu.js
const hasFeature = require('../../utils/featureCheck.js');

module.exports = async function generateStoreMenu(interaction, settings) {
    const isEnabled = settings.store_enabled;
    const statusText = isEnabled ? '✅ Ativada' : '❌ Desativada';
    const toggleButton = isEnabled ? { label: 'Desativar Loja', style: 4 } : { label: 'Ativar Loja', style: 3 };

    const categoriesEnabled = settings.store_categories_enabled;
    const categoriesStatusText = categoriesEnabled ? '✅ Ativado' : '❌ Desativado';
    const toggleCategoriesButton = categoriesEnabled ? { label: 'Desativar Categorias', style: 4 } : { label: 'Ativar Categorias', style: 3 };

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
                    "type": 9, "accessory": { "type": 2, "style": toggleCategoriesButton.style, "label": toggleCategoriesButton.label, "custom_id": "store_toggle_categories" },
                    "components": [{ "type": 10, "content": `**Sistema de Categorias**\n> Status: ${categoriesStatusText}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Gerenciar Produtos", "custom_id": "store_manage_products" },
                    "components": [{ "type": 10, "content": `**Catálogo de Produtos**` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Gerenciar Categorias", "custom_id": "store_manage_categories" },
                    "components": [{ "type": 10, "content": `**Categorias da Loja**` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                 {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Gerenciar Cupons", "custom_id": "store_manage_coupons" },
                    "components": [{ "type": 10, "content": `**Cupons de Desconto**` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Configurar", "custom_id": "store_config_main" },
                    "components": [{ "type": 10, "content": `**Configurações Essenciais**` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Personalizar", "custom_id": "store_customize_vitrine", "disabled": !hasStorePremium, "emoji": { "name": "🎨" } },
                    "components": [{ "type": 10, "content": `**Aparência da Vitrine (Premium)**` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Analisar", "custom_id": "store_open_analytics", "disabled": !hasStorePremium, "emoji": { "name": "📈" } },
                    "components": [{ "type": 10, "content": `**Dashboard de Vendas (Premium)**` }]
                },
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