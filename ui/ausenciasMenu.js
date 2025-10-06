// ui/ausenciasMenu.js
module.exports = function generateAusenciasMenu(settings, isPremium) {
    const canalAprovacoes = settings?.ausencias_canal_aprovacoes ? `<#${settings.ausencias_canal_aprovacoes}>` : '`❌ Não definido`';
    const cargoAusente = settings?.ausencias_cargo_ausente ? `<@&${settings.ausencias_cargo_ausente}>` : '`❌ Não definido`';
    const canalLogs = settings?.ausencias_canal_logs ? `<#${settings.ausencias_canal_logs}>` : '`❌ Não definido`';
    const imagemVitrine = settings?.ausencias_imagem_vitrine ? '`✅ Definida`' : '`❌ Não definida`';

    return [
        {
            "type": 17, "accent_color": 16711680, "spoiler": false,
            "components": [
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 4, "label": "Publicar vitrine", "custom_id": "ausencia_publicar_vitrine" },
                    "components": [{ "type": 10, "content": "# Hub de Ausências" }]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "emoji": { "name": "⚙️" }, "custom_id": "ausencia_set_canal_aprovacoes" },
                    "components": [{ "type": 10, "content": `**Canal de Aprovações**\n> ${canalAprovacoes}` }]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "emoji": { "name": "⚙️" }, "custom_id": "ausencia_set_cargo" },
                    "components": [{ "type": 10, "content": `**Cargo para ausentes**\n> ${cargoAusente}` }]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "emoji": { "name": "⚙️" }, "custom_id": "ausencia_set_canal_logs" },
                    "components": [{ "type": 10, "content": `**Canal de logs**\n> ${canalLogs}` }]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "emoji": { "name": "⚙️" }, "custom_id": "ausencia_set_imagem", "disabled": !isPremium },
                    "components": [{ "type": 10, "content": `**📸 Imagem da vitrine**\n> ${imagemVitrine}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1,
                    "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "main_menu_back" }]
                },
                                // =======================================================
                // ==                RODAPÉ ADICIONADO AQUI             ==
                // =======================================================
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 10, // Tipo 10 é um componente de Texto
                    // VVV   SUBSTITUA PELO TEXTO DO SEU RODAPÉ AQUI   VVV
                    "content": " ↘   Conheça tambem o PoliceFlow e FactionFlow! 🥇" 
                }
                // =======================================================
            ]

            
        }
    ];
    

    
}