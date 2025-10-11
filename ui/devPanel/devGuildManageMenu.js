// Substitua o conteúdo em: ui/devPanel/devGuildManageMenu.js
const FEATURES = require('../../config/features.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateDevGuildManageMenu(guild, settings) {
    const activeFeatures = settings?.enabled_features?.split(',').filter(Boolean) || [];
    const expiresAt = settings?.premium_expires_at ? `<t:${Math.floor(new Date(settings.premium_expires_at).getTime() / 1000)}:f>` : '`Licença Inativa`';
    const featureList = FEATURES.map(f => `> ${activeFeatures.includes(f.value) ? '✅' : '❌'} ${f.label} (\`${f.value}\`)`).join('\n');

    const isAiDisabledByDev = settings?.ai_services_disabled_by_dev;
    const toggleAiButton = isAiDisabledByDev ? { label: "IA na Guild: Desativada", style: 4, emoji: "❌" } : { label: "IA na Guild: Ativada", style: 3, emoji: "✅" };

    // NOVOS BOTÕES DE AÇÃO RÁPIDA
    const quickActions = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`dev_guild_force_leave_${guild.id}`).setLabel("Forçar Saída").setStyle(ButtonStyle.Danger).setEmoji('🚪'),
        new ButtonBuilder().setCustomId(`dev_guild_reset_settings_${guild.id}`).setLabel("Resetar Configs").setStyle(ButtonStyle.Danger).setEmoji('🔄'),
        new ButtonBuilder().setCustomId(`dev_guild_send_dm_${guild.id}`).setLabel("DM Dono").setStyle(ButtonStyle.Primary).setEmoji('✉️')
    );

    return [
        {
            "type": 17, "accent_color": 3447003,
            "components": [
                { "type": 10, "content": `## ⚙️ Gerenciando: ${guild.name}` },
                { "type": 10, "content": `> **ID:** \`${guild.id}\`\n> **Expira em:** ${expiresAt}` },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### Ações Rápidas:" },
                { "type": 1, "components": quickActions.toJSON().components },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### Features Ativas:" },
                { "type": 10, "content": featureList },
                { "type": 14, "divider": true, "spacing": 2 },
                { "type": 1, "components": [
                        { "type": 2, "style": 1, "label": "Editar Features", "emoji": { "name": "✨" }, "custom_id": `dev_guild_edit_features_${guild.id}` },
                        { "type": 2, "style": 1, "label": "Editar Validade", "emoji": { "name": "📅" }, "custom_id": `dev_guild_edit_expiry_${guild.id}` }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 1, "components": [
                        { "type": 2, "style": toggleAiButton.style, "label": toggleAiButton.label, "emoji": { "name": toggleAiButton.emoji }, "custom_id": `dev_guild_toggle_ai_${guild.id}` }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "dev_manage_guilds" }] }
            ]
        }
    ];
};