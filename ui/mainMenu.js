// ui/mainMenu.js
const isPremiumActive = require('../utils/premiumCheck.js');
const db = require('../database.js');

module.exports = async function generateMainMenu(interaction) {
    // Garante que o servidor tenha um registro no banco de dados antes de continuar
    await db.query(`INSERT INTO guild_settings (guild_id) VALUES ($1) ON CONFLICT (guild_id) DO NOTHING`, [interaction.guild.id]);
    
    const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
    const isPremium = await isPremiumActive(interaction.guild.id);

    let premiumStatusText;
    if (isPremium) {
        const expiresAt = new Date(settings.premium_expires_at);
        // Formata a data para o padrão brasileiro
        const formattedDate = expiresAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        premiumStatusText = `> ✨ **Status Premium:** Ativo\n> 📅 **Expira em:** ${formattedDate}`;
    } else {
        premiumStatusText = `> ✨ **Status Premium:** Inativo\n> 💡 Ative uma chave para liberar a personalização de imagens!`;
    }

    // Retorna a estrutura completa do menu, incluindo o novo dashboard
    return [
        {
            "type": 17, "accent_color": 42751, "spoiler": false,
            "components": [
                { "type": 10, "content": `## Hub de Configurações - ${interaction.guild.name}` },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": premiumStatusText },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Abrir", "emoji": { "name": "📥" }, "custom_id": "open_ausencias_menu" },
                    "components": [
                        { "type": 10, "content": "🏖️ Ausências" },
                        { "type": 10, "content": "Configure todo o sistema de **ausências**." }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Abrir", "emoji": { "name": "📥" }, "custom_id": "open_registros_menu" },
                    "components": [
                        { "type": 10, "content": "📂 Registros" },
                        { "type": 10, "content": "Configure todo o sistema de **registros**." }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Abrir", "emoji": { "name": "📥" }, "custom_id": "open_tickets_menu" },
                    "components": [
                        { "type": 10, "content": "🚨 Tickets" },
                        { "type": 10, "content": "Configure todo o sistema de **tickets**." }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Abrir", "emoji": { "name": "📥" }, "custom_id": "open_uniformes_menu" },
                    "components": [
                        { "type": 10, "content": "👔 Uniformes" },
                        { "type": 10, "content": "Configure todo o sistema de **uniformes**." }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Abrir", "emoji": { "name": "📥" }, "custom_id": "open_ponto_menu" },
                    "components": [
                        { "type": 10, "content": "⏰ Bate-Ponto" },
                        { "type": 10, "content": "Configure todo o sistema de **bate-ponto**." }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": 2, "label": "Novidades", "emoji": { "name": "🎉" }, "disabled": true, "custom_id": "main_novidades" },
                        { "type": 2, "style": 4, "label": "Ativar Key", "emoji": null, "custom_id": "main_ativar_key" },
                        { "type": 2, "style": 2, "label": "Suporte", "emoji": { "name": "🥇" }, "disabled": true, "custom_id": "main_suporte" }
                    ]
                }
            ]
        }
    ];
}