// ui/store/configAdvancedMenu.js

module.exports = async function generateConfigAdvancedMenu(interaction, settings) {
    
    const inactivityMonitor = settings.store_inactivity_monitor_enabled ? '✅ Ativado' : '❌ Desativado';
    const inactivityToggle = settings.store_inactivity_monitor_enabled ? { label: 'Desativar', style: 4 } : { label: 'Ativar', style: 3 };
    const inactivityHours = settings.store_auto_close_hours || 24;

    const dmFlow = settings.store_premium_dm_flow_enabled ? '✅ Ativado' : '❌ Desativado';
    const dmFlowToggle = settings.store_premium_dm_flow_enabled ? { label: 'Desativar', style: 4 } : { label: 'Ativar', style: 3 };

    // --- NOVA LINHA ---
    const publicLogChannel = settings.store_public_log_channel_id ? `<#${settings.store_public_log_channel_id}>` : '`Não definido`';

    return {
        "type": 17, "accent_color": 5763719,
        "components": [
            { "type": 10, "content": "## ⚙️ Configurações Avançadas da Loja" },
            { "type": 10, "content": "> Gerencie opções de automação, logs e outros recursos premium." },
            
            // --- INÍCIO DO NOVO BLOCO ---
            { "type": 14, "divider": true, "spacing": 1 },
            { "type": 10, "content": "### 📣 Log Pública de Vendas" },
            { "type": 10, "content": "> Envie uma mensagem bonita em um canal público sempre que uma compra for aprovada para gerar credibilidade." },
            {
                "type": 9, "accessory": { 
                    "type": 2, 
                    "style": 2, 
                    "label": "Definir Canal", 
                    "custom_id": "store_set_public_log_channel" // Botão para o novo handler
                },
                "components": [{ "type": 10, "content": `> Canal de Log Pública: ${publicLogChannel}` }]
            },
            // --- FIM DO NOVO BLOCO ---

            { "type": 14, "divider": true, "spacing": 1 },
            { "type": 10, "content": "### 🤖 Monitor de Inatividade" },
            { "type": 10, "content": `> Fecha carrinhos inativos após **${inactivityHours} horas**.` },
            {
                "type": 9, "accessory": { "type": 2, "style": inactivityToggle.style, "label": inactivityToggle.label, "custom_id": "store_toggle_inactivity_monitor" },
                "components": [{ "type": 10, "content": `**Monitor de Inatividade:** ${inactivityMonitor}` }]
            },
            {
                "type": 1, "components": [
                    { "type": 2, "style": 2, "label": "Definir Tempo (Horas)", "custom_id": "store_set_auto_close", "disabled": !settings.store_inactivity_monitor_enabled }
                ]
            },
            
            { "type": 14, "divider": true, "spacing": 1 },
            { "type": 10, "content": "### 💬 Fluxo de Atendimento (DM)" },
            { "type": 10, "content": "> Permite que o staff e o cliente conversem pela DM do bot (Requer Premium)." },
            {
                "type": 9, "accessory": { "type": 2, "style": dmFlowToggle.style, "label": dmFlowToggle.label, "custom_id": "store_toggle_dm_flow" },
                "components": [{ "type": 10, "content": `**Atendimento via DM:** ${dmFlow}` }]
            },

            { "type": 14, "divider": true, "spacing": 2 },
            { "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "open_store_menu" }] }
        ]
    };
};