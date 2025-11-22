// File: ui/store/configAdvancedMenu.js
// CORRIGIDO: Agora retorna um ARRAY [...] para evitar o erro .map()

module.exports = async function generateConfigAdvancedMenu(interaction, settings) {
    
    // Variáveis de Estado e Feedback Visual
    const inactivityMonitor = settings.store_inactivity_monitor_enabled ? '✅ Ativado' : '❌ Desativado';
    const inactivityToggle = settings.store_inactivity_monitor_enabled ? { label: 'Desativar', style: 4 } : { label: 'Ativar', style: 3 };
    const inactivityHours = settings.store_auto_close_hours || 24;

    const dmFlow = settings.store_premium_dm_flow_enabled ? '✅ Ativado' : '❌ Desativado';
    const dmFlowToggle = settings.store_premium_dm_flow_enabled ? { label: 'Desativar', style: 4 } : { label: 'Ativar', style: 3 };

    const publicLogChannel = settings.store_public_log_channel_id ? `<#${settings.store_public_log_channel_id}>` : '`Não definido`';
    
    // Verifica se o token existe para mostrar status (Visual)
    const mpStatus = settings.store_mp_token ? "✅ Ativo" : "⚠️ Inativo";

    // [IMPORTANTE] Retorna um ARRAY contendo o objeto V2
    return [
        {
            "type": 17, 
            "accent_color": 5763719,
            "components": [
                { "type": 10, "content": "## ⚙️ Configurações Avançadas da Loja" },
                { "type": 10, "content": "> Gerencie opções de automação, pagamentos e recursos premium." },
                
                // --- SEÇÃO DE PAGAMENTOS (MERCADO PAGO) ---
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### 💳 Pagamentos Automáticos" },
                { "type": 10, "content": `> Configure o Token do Mercado Pago para processar pagamentos automaticamente via Pix.\n> **Status MP:** ${mpStatus}` },
                {
                    "type": 1,
                    "components": [
                        {
                            "type": 2,
                            "style": 2, // Secondary (Cinza)
                            "label": "Configurar Token MP",
                            "emoji": { "name": "💳" },
                            "custom_id": "store_set_mp_token" // Abre o modal existente
                        }
                        // O botão de Chave Pix Manual fica no menu principal, removido daqui para não duplicar.
                    ]
                },
                // -------------------------------------------------------

                // --- SEÇÃO DE LOG PÚBLICA ---
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### 📣 Log Pública de Vendas" },
                { "type": 10, "content": "> Envie uma mensagem bonita em um canal público sempre que uma compra for aprovada." },
                {
                    "type": 9, "accessory": { 
                        "type": 2, 
                        "style": 2, 
                        "label": "Definir Canal", 
                        "custom_id": "store_set_public_log_channel"
                    },
                    "components": [{ "type": 10, "content": `> Canal de Log Pública: ${publicLogChannel}` }]
                },

                // --- SEÇÃO DE INATIVIDADE ---
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
                
                // --- SEÇÃO DE FLUXO DM ---
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### 💬 Fluxo de Atendimento (DM)" },
                { "type": 10, "content": "> Permite que o staff e o cliente conversem pela DM do bot (Requer Premium)." },
                {
                    "type": 9, "accessory": { "type": 2, "style": dmFlowToggle.style, "label": dmFlowToggle.label, "custom_id": "store_toggle_dm_flow", "disabled": true },
                    "components": [{ "type": 10, "content": `**Atendimento via DM:** ${dmFlow}`, "disabled": true } ]
                },

                { "type": 14, "divider": true, "spacing": 2 },
                { "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "open_store_menu" }] }
            ]
        }
    ];
};