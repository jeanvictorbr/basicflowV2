// ui/registrosMenu.js
const hasFeature = require('../utils/featureCheck.js');

module.exports = async function generateRegistrosMenu(interaction, settings) {

    const systemStatus = settings.registros_status ? '✅ Ativado' : '❌ Desativado';
    const toggleButtonLabel = settings.registros_status ? 'Desativar Sistema' : 'Ativar Sistema';
    const toggleButtonStyle = settings.registros_status ? 4 : 3;

    const canalAprovacoes = settings.registros_canal_aprovacoes ? `<#${settings.registros_canal_aprovacoes}>` : '`Nenhum`';
    const canalLogs = settings.registros_canal_logs ? `<#${settings.registros_canal_logs}>` : '`Nenhum`';
    const cargoAprovado = settings.registros_cargo_aprovado ? `<@&${settings.registros_cargo_aprovado}>` : '`Nenhum`';
    const tagAprovado = settings.registros_tag_aprovado ? `\`${settings.registros_tag_aprovado}\`` : '`Nenhuma`';

    // CORREÇÃO: A verificação de feature agora funciona corretamente
    const hasCustomVisuals = await hasFeature(interaction.guild.id, 'CUSTOM_VISUALS');

    return [
        {
            "type": 17,
            "accent_color": 15844367,
            "components": [
                {
                    "type": 10,
                    "content": "## 📂 Registros (Whitelist)"
                },
                {
                    "type": 10,
                    "content": `> Status do Sistema: **${systemStatus}**`
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 2, "label": "Definir Canal", "custom_id": "registros_set_canal_aprovacoes" },
                    "components": [{ "type": 10, "content": `**Canal de Aprovações:**\n${canalAprovacoes}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 2, "label": "Definir Canal", "custom_id": "registros_set_canal_logs" },
                    "components": [{ "type": 10, "content": `**Canal de Logs:**\n${canalLogs}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 2, "label": "Definir Cargo", "custom_id": "registros_set_cargo_aprovado" },
                    "components": [{ "type": 10, "content": `**Cargo de Aprovado:**\n${cargoAprovado}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 2, "label": "Definir Tag", "custom_id": "registros_set_tag_aprovado" },
                    "components": [{ "type": 10, "content": `**Tag de Aprovado:**\n${tagAprovado} (Ex: [Aprovado] Nick | ID)` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 2, "label": "Definir Imagem", "custom_id": "registros_set_imagem_vitrine", "disabled": !hasCustomVisuals },
                    "components": [{ "type": 10, "content": "**Imagem da Vitrine (Premium)**\n> Personalize a imagem do painel de registro." }]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": toggleButtonStyle, "label": toggleButtonLabel, "custom_id": "registros_toggle_status" },
                        { "type": 2, "style": 1, "label": "Publicar Vitrine", "custom_id": "registros_publicar_vitrine", "disabled": !settings.registros_status, "emoji": { name: '📢' } }
                    ]
                },
                {
                    "type": 1,
                    "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "main_menu_back" }]
                }
            ]
        }
    ];
};