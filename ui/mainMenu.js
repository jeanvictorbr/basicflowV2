// ui/mainMenu.js
const isPremiumActive = require('../utils/premiumCheck.js');
const db = require('../database.js');

module.exports = async function generateMainMenu(interaction) {
    await db.query(`INSERT INTO guild_settings (guild_id) VALUES ($1) ON CONFLICT (guild_id) DO NOTHING`, [interaction.guild.id]);
    
    const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
    const isPremium = await isPremiumActive(interaction.guild.id);

    let premiumStatusText;
    if (isPremium) {
        const expiresAt = new Date(settings.premium_expires_at);
        const formattedDate = expiresAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        premiumStatusText = `> ✨ **Premium:** Ativo (Expira em: ${formattedDate})`;
    } else {
        premiumStatusText = `> ✨ **Premium:** Inativo`;
    }

    // Estrutura simplificada para reduzir o número de componentes
    const modulesText = [
        `🏖️ **Ausências:** Configure o sistema de ausências.`,
        `📂 **Registros:** Gerencie o sistema de whitelist/registros.`,
        `🚨 **Tickets:** Administre o sistema de suporte.`,
        `👔 **Uniformes:** Monte a vitrine de uniformes.`,
        `⏰ **Bate-Ponto:** Controle o sistema de ponto.`,
        `🛡️ **Guardian AI:** Configure a moderação proativa.`
    ].join('\n> \n> ');

    return [
        {
            "type": 17, "accent_color": 42751,
            "components": [
                { "type": 10, "content": `## Hub de Configurações - ${interaction.guild.name}` },
                { "type": 10, "content": premiumStatusText },
                { "type": 14, "divider": true, "spacing": 1 },

                // Módulos agrupados para economizar componentes
                { "type": 10, "content": `> ${modulesText}` },
                { "type": 14, "divider": true, "spacing": 2 },

                // Botões de Ação
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": 2, "label": "Ausências", "custom_id": "open_ausencias_menu" },
                        { "type": 2, "style": 2, "label": "Registros", "custom_id": "open_registros_menu" },
                        { "type": 2, "style": 2, "label": "Tickets", "custom_id": "open_tickets_menu" },
                    ]
                },
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": 2, "label": "Uniformes", "custom_id": "open_uniformes_menu" },
                        { "type": 2, "style": 2, "label": "Bate-Ponto", "custom_id": "open_ponto_menu" },
                        { "type": 2, "style": 2, "label": "Guardian AI", "custom_id": "open_guardian_menu", "disabled": !isPremium },
                    ]
                },
                 { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": 3, "label": "Ativar Key", "custom_id": "main_ativar_key" },
                        { "type": 2, "style": 1, "label": "Estatísticas", "emoji": { "name": "📊" }, "disabled": !isPremium, "custom_id": "main_show_stats" }
                    ]
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