// ui/updatesMenu.js
const db = require('../database');

module.exports = async (interaction) => {
    const settings = (await db.query('SELECT updates_channel_id FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
    const updatesChannelId = settings.updates_channel_id;
    const channel = updatesChannelId ? await interaction.guild.channels.cache.get(updatesChannelId) : null;
    const channelStatus = channel ? `✅ Configurado em ${channel}` : '❌ Nenhum canal configurado.';

    return [
        {
            "type": 17,
            "accent_color": 5793266, // Cor azul do BasicFlow
            "components": [
                { "type": 10, "content": "## 📢 Canal de Atualizações" },
                { "type": 10, "content": "> Configure para receber novidades e correções do BasicFlow." },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": `**Canal Atual:**\n> ${channelStatus}` },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": 1, "label": "Definir/Alterar Canal", "emoji": { "name": "🔧" }, "custom_id": "updates_set_channel" },
                        { "type": 2, "style": 2, "label": "Voltar", "custom_id": "main_menu_back" }
                    ]
                }
            ]
        }
    ];
};