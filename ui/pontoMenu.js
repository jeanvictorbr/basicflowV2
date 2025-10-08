// ui/pontoMenu.js
const hasFeature = require('../utils/featureCheck.js');

module.exports = async function generatePontoMenu(interaction, settings) {
    const canalLogs = settings?.ponto_canal_registros ? `<#${settings.ponto_canal_registros}>` : '`❌ Não definido`';
    const cargoServico = settings?.ponto_cargo_em_servico ? `<@&${settings.ponto_cargo_em_servico}>` : '`❌ Não definido`';
    const imagemVitrine = settings?.ponto_imagem_vitrine ? '`✅ Definida`' : '`❌ Não definida`';

    const isConfigured = settings?.ponto_canal_registros && settings?.ponto_cargo_em_servico;
    const status = settings?.ponto_status === true ? { label: 'Desativar Sistema', style: 4, emoji: '🔒' } : { label: 'Ativar Sistema', style: 3, emoji: '🔓' };

    const hasPontoPremium = await hasFeature(interaction.guild.id, 'PONTO_PREMIUM');
    const hasCustomVisuals = await hasFeature(interaction.guild.id, 'CUSTOM_VISUALS');

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
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "custom_id": "ponto_set_imagem_vitrine", "disabled": !hasCustomVisuals },
                    "components": [{ "type": 10, "content": `**Imagem do Painel**\n> ${imagemVitrine}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "main_menu_back" },
                        { "type": 2, "style": 2, "label": "Consultar Jogador", "custom_id": "ponto_consultar_jogador", "disabled": false },
                        { "type": 2, "style": status.style, "label": status.label, "emoji": { "name": status.emoji }, "custom_id": "ponto_toggle_status", "disabled": !isConfigured }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": 1, "label": "+ Config. Premium", "emoji": { "name": "✨" }, "custom_id": "ponto_open_premium_menu", "disabled": !hasPontoPremium }
                    ]
              },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 10,
                    "content": " ↘   Configure para conseguir ativar" 
                }
            ]
        }   
    ];
};