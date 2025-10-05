// Agora, em vez de um objeto, exportamos uma FUNÇÃO que gera o menu.
// Ela recebe um objeto 'settings' com as configurações atuais.
module.exports = function generateAusenciasMenu(settings) {
    // Usamos ?? 'Não definido' para garantir que, se uma configuração for nula,
    // mostramos um texto padrão.
    const canalAprovacoes = settings?.canalAprovacoes ?? '`Não definido`';
    const cargoAusente = settings?.cargoAusente ?? '`Não definido`';
    const canalLogs = settings?.canalLogs ?? '`Não definido`';
    const imagemVitrine = settings?.imagemVitrine ?? '`Não definida`';

    return [
        {
            "type": 17,
            "accent_color": 16711680,
            "spoiler": false,
            "components": [
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Publicar vitrine", "custom_id": "ausencia_publicar_vitrine" },
                    "components": [{ "type": 10, "content": "**Hub de Ausências**" }]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "emoji": { "name": "⚙️" }, "custom_id": "ausencia_set_canal_aprovacoes" },
                    // AQUI INJETAMOS A CONFIGURAÇÃO ATUAL
                    "components": [{ "type": 10, "content": `**🙋‍♂️ Canal de Aprovações de ausências**\n> ${canalAprovacoes}` }]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "emoji": { "name": "⚙️" }, "custom_id": "ausencia_set_cargo" },
                    "components": [{ "type": 10, "content": `**🏖️ Cargo para ausentes**\n> ${cargoAusente}` }]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "emoji": { "name": "⚙️" }, "custom_id": "ausencia_set_canal_logs" },
                    "components": [{ "type": 10, "content": `**🚨 Canal de logs**\n> ${canalLogs}` }]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "emoji": { "name": "⚙️" }, "custom_id": "ausencia_set_imagem" },
                    "components": [{ "type": 10, "content": `**📸 Imagem da vitrine**\n> ${imagemVitrine}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1,
                    "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "main_menu_back" }]
                },
                { "type": 14, "divider": true, "spacing": 1 }
            ]
        }
    ];
}