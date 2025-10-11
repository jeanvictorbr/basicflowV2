// ui/store/configAdvancedMenu.js
const hasFeature = require('../../utils/featureCheck.js');

module.exports = async function generateConfigAdvancedMenu(interaction, settings) {
    const inactivityMonitor = settings.store_inactivity_monitor_enabled ? '✅ Ativado' : '❌ Desativado';
    const toggleMonitorButton = settings.store_inactivity_monitor_enabled ? { label: 'Desativar', style: 4 } : { label: 'Ativar', style: 3 };
    const autoCloseHours = settings.store_auto_close_hours || 24;
    const hasStorePremium = await hasFeature(interaction.guild.id, 'STORE_PREMIUM');
    const dmFlowEnabled = settings.store_premium_dm_flow_enabled;
    const dmFlowStatus = dmFlowEnabled ? '✅ Ativado (VIP)' : '❌ Desativado (Padrão)';
    const toggleDmFlowButton = dmFlowEnabled ? { label: 'Desativar', style: 4 } : { label: 'Ativar', style: 3 };

    const mpTokenStatus = settings.store_mp_token ? '✅ Configurado' : '❌ Não Configurado';

    return [
        {
            "type": 17, "accent_color": 15105570,
            "components": [
                { "type": 10, "content": "## ⚙️ Configurações Avançadas da Loja (Premium)" },
                { "type": 10, "content": "> Gerencie as automações e funcionalidades premium do seu StoreFlow." },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, 
                    "accessory": { "type": 2, "style": 1, "label": "Configurar Token", "custom_id": "store_set_mp_token","disabled": !hasStorePremium, },
                    "components": [{ "type": 10, "content": `**Integração com Mercado Pago**\n> Status do Token: ${mpTokenStatus}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, 
                    "accessory": { "type": 2, "style": toggleDmFlowButton.style, "label": toggleDmFlowButton.label, "custom_id": "store_toggle_dm_flow", disabled: "true" },
                    "components": [{ "type": 10, "content": `**Fluxo de Compra via DM**\n> Status: ${dmFlowStatus}` }]
                },
                { "type": 10, "content": "> *Quando ativado, a compra é feita na DM do usuário com opção de atendimento da staff. Desativado, o carrinho é criado em um canal no servidor.*" },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, 
                    "accessory": { "type": 2, "style": toggleMonitorButton.style, "label": toggleMonitorButton.label, "custom_id": "store_toggle_inactivity_monitor" },
                    "components": [{ "type": 10, "content": `**Monitor de Inatividade**\n> Status: ${inactivityMonitor}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, 
                    "accessory": { "type": 2, "style": 1, "label": "Definir Tempo", "custom_id": "store_set_auto_close", "disabled": !settings.store_inactivity_monitor_enabled },
                    "components": [{ "type": 10, "content": `**Auto-Fechamento de Carrinhos**\n> Fechar carrinhos inativos há \`${autoCloseHours}\` horas.` }]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 2, "label": "Página Anterior", "emoji": { "name": "⬅️" }, "custom_id": "store_config_main" }
                    ]
                }
            ]
        }
    ];
};