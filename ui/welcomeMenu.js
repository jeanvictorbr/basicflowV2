// Substitua o conteúdo em: ui/welcomeMenu.js
const hasFeature = require('../utils/featureCheck.js');

module.exports = async function generateWelcomeMenu(interaction, settings) {
    const welcomeStatus = settings.welcome_enabled ? '✅ Ativado' : '❌ Desativado';
    const welcomeToggle = settings.welcome_enabled ? { label: 'Desativar', style: 4 } : { label: 'Ativar', style: 3 };
    const welcomeChannel = settings.welcome_channel_id ? `<#${settings.welcome_channel_id}>` : '`Não definido`';

    const goodbyeStatus = settings.goodbye_enabled ? '✅ Ativado' : '❌ Desativado';
    const goodbyeToggle = settings.goodbye_enabled ? { label: 'Desativar', style: 4 } : { label: 'Ativar', style: 3 };
    const goodbyeChannel = settings.goodbye_channel_id ? `<#${settings.goodbye_channel_id}>` : '`Não definido`';

    const hasCustomVisuals = await hasFeature(interaction.guild.id, 'CUSTOM_VISUALS');

    // PADRÃO CORRETO: Retorna o objeto diretamente, sem o array em volta
    return {
        "type": 17, "accent_color": 5763719,
        "components": [
            { "type": 10, "content": "## 👋 Hub de Boas-Vindas e Despedidas" },
            { "type": 10, "content": "> Configure as mensagens de boas-vindas para novos membros e de despedida quando alguém sai." },
            { "type": 14, "divider": true, "spacing": 1 },
            {
                "type": 9, "accessory": { "type": 2, "style": welcomeToggle.style, "label": welcomeToggle.label, "custom_id": "welcome_toggle_system" },
                "components": [{ "type": 10, "content": `**Mensagens de Boas-Vindas:** ${welcomeStatus}` }]
            },
            {
                "type": 9, "accessory": { "type": 2, "style": 2, "label": "Definir Canal", "custom_id": "welcome_set_channel" },
                "components": [{ "type": 10, "content": `> Canal de Boas-Vindas: ${welcomeChannel}` }]
            },
            { "type": 14, "divider": true, "spacing": 1 },
            {
                "type": 1, "components": [
                    { "type": 2, "style": 1, "label": "Editar Mensagem", "emoji": { "name": "📝" }, "custom_id": "welcome_edit_embed" },
                    { "type": 2, "style": 1, "label": "Editar Thumbnail", "emoji": { "name": "🖼️" }, "custom_id": "welcome_set_thumbnail", "disabled": !hasCustomVisuals },
                    { "type": 2, "style": 1, "label": "Editar Rodapé", "emoji": { "name": "✍️" }, "custom_id": "welcome_set_footer", "disabled": !hasCustomVisuals }
                ]
            },
            { "type": 14, "divider": true, "spacing": 2 },
            {
                "type": 9, "accessory": { "type": 2, "style": goodbyeToggle.style, "label": goodbyeToggle.label, "custom_id": "goodbye_toggle_system" },
                "components": [{ "type": 10, "content": `**Mensagens de Despedida:** ${goodbyeStatus}` }]
            },
            {
                "type": 9, "accessory": { "type": 2, "style": 2, "label": "Definir Canal", "custom_id": "goodbye_set_channel" },
                "components": [{ "type": 10, "content": `> Canal de Despedidas: ${goodbyeChannel}` }]
            },
            { "type": 14, "divider": true, "spacing": 2 },
            { "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "main_menu_back" }] }
        ]
    };
};