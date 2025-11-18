// ui/registrosMenu.js
// SEGUINDO O PADRÃO V17 ORIGINAL
// - Seção CAPTCHA removida.
// - Seção OAUTH2 adicionada.

function getStatus(value) {
    return value ? '✅ Ativado' : '❌ Desativado';
}
function getChannel(value) {
    return value ? `<#${value}>` : '`Não definido`';
}
function getRole(value) {
    return value ? `<@&${value}>` : '`Não definido`';
}

module.exports = async function generateRegistrosMenu(interaction, settings) {
    
    // --- Configs do Sistema de Aprovação (Existente) ---
    const statusAprovacao = getStatus(settings.registros_status);
    const toggleAprovacao = settings.registros_status ? { label: 'Desativar', style: 4 } : { label: 'Ativar', style: 3 };
    const canalAprovacoes = getChannel(settings.registros_canal_aprovacoes);
    const cargoAprovado = getRole(settings.registros_cargo_aprovado);
    const canalLogsAprovacao = getChannel(settings.registros_canal_logs);

    // --- Configs do Sistema de CAPTCHA (REMOVIDO) ---
    // ...

    return {
        "type": 17, "accent_color": 5763719,
        "components": [
            { "type": 10, "content": "## 🛂 Módulo de Registros e Verificação" },
            { "type": 10, "content": "> Gerencie como os novos membros são autenticados no seu servidor." },
            
            // --- Seção: Verificação por CAPTCHA (REMOVIDO) ---
            // ...

            // ===== NOVO SISTEMA: VERIFICAÇÃO OAUTH (ADICIONADO) =====
            { "type": 14, "divider": true, "spacing": 1 },
            {
                "type": 9, "accessory": { "type": 2, "style": 3, "label": "Configurar", "emoji": { "name": "🔗" }, "custom_id": "aut_reg_open_oauth_hub" },
                "components": [
                    { "type": 10, "content": "### 🔗 Verificação via OAuth (Recomendado)" },
                    { "type": 10, "content": "> **Método mais confiável.** Permite ao admin gerenciar e transferir membros entre servidores, garantindo acesso contínuo." }
                ]
            },
            // ==============================================================

            // --- Seção: Registro por Aprovação (Existente) ---
            { "type": 14, "divider": true, "spacing": 1 },
            { "type": 10, "content": "### 📝 Registro por Aprovação" },
            { "type": 10, "content": "> Um sistema manual onde o usuário preenche um formulário e a staff aprova ou recusa." },
            {
                "type": 9, "accessory": { "type": 2, "style": toggleAprovacao.style, "label": toggleAprovacao.label, "custom_id": "registros_toggle_status" },
                "components": [{ "type": 10, "content": `**Sistema de Aprovação:** ${statusAprovacao}` }]
            },
            {
                "type": 9, "accessory": { "type": 2, "style": 2, "label": "Definir Canal", "custom_id": "registros_set_canal_aprovacoes", "disabled": !settings.registros_status },
                "components": [{ "type": 10, "content": `> Canal de Aprovações: ${canalAprovacoes}` }]
            },
            {
                "type": 9, "accessory": { "type": 2, "style": 2, "label": "Definir Cargo", "custom_id": "registros_set_cargo_aprovado", "disabled": !settings.registros_status },
                "components": [{ "type": 10, "content": `> Cargo de Aprovado: ${cargoAprovado}` }]
            },
            {
                "type": 9, "accessory": { "type": 2, "style": 2, "label": "Definir Logs", "custom_id": "registros_set_canal_logs", "disabled": !settings.registros_status },
                "components": [{ "type": 10, "content": `> Canal de Logs: ${canalLogsAprovacao}` }]
            },
            {
                "type": 1, "components": [
                    { "type": 2, "style": 1, "label": "Configurar Vitrine", "emoji": { "name": "🖼️" }, "custom_id": "registros_config_vitrine", "disabled": !settings.registros_status }
                ]
            },

            // --- Voltar ---
            { "type": 14, "divider": true, "spacing": 2 },
            { "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "main_menu_back" }] }
        ]
    };
};