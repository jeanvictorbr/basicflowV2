// Substitua o conteúdo em: ui/devPanel/devGuildManageMenu.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateDevGuildManageMenu(guild, settings) {
    const activeFeatures = settings.enabled_features ? settings.enabled_features.split(',') : [];

    const isBotEnabledInGuild = settings?.bot_enabled_in_guild !== false;
    const toggleBotStatusButton = isBotEnabledInGuild
        ? { label: "Bot na Guild: Ativado", style: ButtonStyle.Success, emoji: "✅" }
        : { label: "Bot na Guild: Desativado", style: ButtonStyle.Danger, emoji: "❌" };

    const isAiDisabledByDev = settings?.ai_services_disabled_by_dev;
    const toggleAiButton = isAiDisabledByDev
        ? { label: "IA na Guild: Desativada", style: ButtonStyle.Danger, emoji: "❌" }
        : { label: "IA na Guild: Ativada", style: ButtonStyle.Success, emoji: "✅" };

    const quickActions = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`dev_guild_force_leave_${guild.id}`).setLabel("Forçar Saída").setStyle(ButtonStyle.Danger).setEmoji('🚪'),
        new ButtonBuilder().setCustomId(`dev_guild_reset_settings_${guild.id}`).setLabel("Resetar Configs").setStyle(ButtonStyle.Danger).setEmoji('🔄'),
        new ButtonBuilder().setCustomId(`dev_guild_send_dm_${guild.id}`).setLabel("DM Dono").setStyle(ButtonStyle.Primary).setEmoji('✉️')
    );
    
    const featuresListText = activeFeatures.length > 0
        ? activeFeatures.map(f => `> ✨ **${f}**`).join('\n')
        : '> `Nenhuma feature premium ativa.`';

    return [
        {
            "type": 17, "accent_color": 3447003,
            "components": [
                { "type": 10, "content": `## ⚙️ Gerenciando: ${guild.name}` },
                { "type": 10, "content": `> **ID:** \`${guild.id}\`` },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### Features Ativas:" },
                { "type": 10, "content": featuresListText },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### Ações Rápidas:" },
                { "type": 1, "components": quickActions.toJSON().components },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### Controles de Status:" },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": toggleBotStatusButton.style, "label": toggleBotStatusButton.label, "emoji": { "name": toggleBotStatusButton.emoji }, "custom_id": `dev_guild_toggle_status_${guild.id}` },
                        { "type": 2, "style": 2, "label": "Definir Mensagem", "emoji": { "name": "📝" }, "custom_id": `dev_guild_set_maintenance_message_${guild.id}` },
                    ]
                },
                {
                    "type": 1, "components": [
                         { "type": 2, "style": toggleAiButton.style, "label": toggleAiButton.label, "emoji": { "name": toggleAiButton.emoji }, "custom_id": `dev_guild_toggle_ai_${guild.id}` }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 1, "components": [
                        // BOTÕES DE GERENCIAMENTO
                        { "type": 2, "style": 1, "label": "Gerenciar Features", "emoji": { "name": "✨" }, "custom_id": `dev_guild_edit_features_${guild.id}` },
                        { "type": 2, "style": 1, "label": "Inspecionar Atividade", "emoji": { "name": "🔍" }, "custom_id": `dev_guild_inspect_activity_${guild.id}` }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "dev_manage_guilds" }] }
            ]
        }
    ];
};