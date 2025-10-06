// ui/pontoMenu.js
module.exports = function generatePontoMenu(settings) {
    const canalLogs = settings?.ponto_canal_registros ? `<#${settings.ponto_canal_registros}>` : '`❌ Não definido`';
    const cargoServico = settings?.ponto_cargo_em_servico ? `<@&${settings.ponto_cargo_em_servico}>` : '`❌ Não definido`';
    const imagemVitrine = settings?.ponto_imagem_vitrine ? '`✅ Definida`' : '`❌ Não definida`';

    const isConfigured = settings?.ponto_canal_registros && settings?.ponto_cargo_em_servico;
    const status = settings?.ponto_status === true ? { label: 'Desativar Sistema', style: 4, emoji: '🔒' } : { label: 'Ativar Sistema', style: 3, emoji: '🔓' };

    return [
        {
            "type": 17, "accent_color": 1376000, "spoiler": false,
            "components": [
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 4, "label": "Publicar Painel", "custom_id": "ponto_publicar_painel" },
                    "components": [{ "type": 10, "content": "# Hub de Bate-Ponto" }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "custom_id": "ponto_set_canal_registros" },
                    "components": [{ "type": 10, "content": `**Canal de Logs**\n> ${canalLogs}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "custom_id": "ponto_set_cargo_servico" },
                    "components": [{ "type": 10, "content": `**Cargo em Serviço**\n> ${cargoServico}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "custom_id": "ponto_set_imagem_vitrine" },
                    "components": [{ "type": 10, "content": `**Imagem do Painel**\n> ${imagemVitrine}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "main_menu_back" },
                        { "type": 2, "style": 4, "label": "Consultar Jogador", "custom_id": "ponto_consultar_jogador" },
                        { "type": 2, "style": status.style, "label": status.label, "emoji": { "name": status.emoji }, "custom_id": "ponto_toggle_status", "disabled": !isConfigured }
                    ]
                }
            ]
        }
    ];
};