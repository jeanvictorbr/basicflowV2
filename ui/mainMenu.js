// ui/mainMenu.js
const hasFeature = require('../utils/featureCheck.js');
const db = require('../database.js');
const FEATURES = require('../config/features.js');

module.exports = async function generateMainMenu(interaction, page = 0) {
    const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
    
    let premiumStatusText;
    const enabledFeatures = settings.enabled_features?.split(',').filter(Boolean) || [];

    if (enabledFeatures.length > 0 && settings.premium_expires_at) {
        const expiresAt = new Date(settings.premium_expires_at);
        const formattedDate = expiresAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        let featuresList = '`ALL`'; // Padrão se 'ALL' estiver incluído
        if (!enabledFeatures.includes('ALL')) {
            featuresList = enabledFeatures.map(f => `\`${f}\``).join(', ');
        }

        premiumStatusText = `> ✨ **Status da Licença:** Ativa\n` +
                          `> 📅 **Expira em:** ${formattedDate}\n` +
                          `> 🔑 **Acessos Liberados:** ${featuresList}`;
    } else {
        premiumStatusText = `> ✨ **Status da Licença:** Inativa\n> 💡 Ative uma chave para liberar funcionalidades exclusivas!`;
    }
    
    // Verificações granulares para cada módulo
    const hasGuardianAccess = await hasFeature(interaction.guild.id, 'GUARDIAN_AI');
    const hasStatsAccess = await hasFeature(interaction.guild.id, 'STATS');
    const hasModPremiumAccess = await hasFeature(interaction.guild.id, 'MODERATION_PREMIUM');
    
    const allModules = [
        {
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "📥" }, custom_id: "open_ausencias_menu" },
            components: [{ type: 10, content: "🏖️ Ausências" }, { type: 10, content: "Configure todo o sistema de **ausências**." }]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "📥" }, custom_id: "open_registros_menu" },
            components: [{ type: 10, content: "📂 Registros" }, { type: 10, content: "Configure todo o sistema de **registros**." }]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "📥" }, custom_id: "open_tickets_menu" },
            components: [{ type: 10, content: "🚨 Tickets" }, { type: 10, content: "Configure todo o sistema de **tickets**." }]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "📥" }, custom_id: "open_moderacao_menu" },
            components: [{ type: 10, content: "⚖️ Moderação" }, { type: 10, content: "Configure as ferramentas da sua **equipa de staff**." }]
        },
        // --- FIM DA PÁGINA 1 ---
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "📥" }, custom_id: "open_uniformes_menu" },
            components: [{ type: 10, content: "👔 Uniformes" }, { type: 10, content: "Configure todo o sistema de **uniformes**." }]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "📥" }, custom_id: "open_ponto_menu" },
            components: [{ type: 10, content: "⏰ Bate-Ponto" }, { type: 10, content: "Configure todo o sistema de **bate-ponto**." }]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "🛡️" }, custom_id: "open_guardian_menu", disabled: !hasGuardianAccess },
            components: [{ type: 10, content: "🛡️ Guardian AI (Premium)" }, { type: 10, content: "Moderação proativa para **prevenir conflitos**." }]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "📥" }, custom_id: "open_roletags_menu" },
            components: [{ type: 10, content: "🏷️ Tags por Cargo (RoleTags)" }, { type: 10, content: "Aplique tags aos apelidos baseadas em cargos." }]
        },
        // --- FIM DA PÁGINA 2 ---
    ];
    
    const ITEMS_PER_PAGE = 4; 
    const itemsWithDividersPerPage = ITEMS_PER_PAGE * 2;
    const paginatedModules = allModules.slice(page * itemsWithDividersPerPage, (page + 1) * itemsWithDividersPerPage);
    if (paginatedModules.length > 0 && paginatedModules[paginatedModules.length - 1].type === 14) {
        paginatedModules.pop();
    }
    
    const totalPages = Math.ceil(allModules.length / itemsWithDividersPerPage);

    const paginationButtons = {
        type: 1,
        components: [
            { type: 2, style: 2, label: "Página Anterior", custom_id: `main_menu_page_${page - 1}`, disabled: page === 0 },
            { type: 2, style: 2, label: "Próxima Página", custom_id: `main_menu_page_${page + 1}`, disabled: page + 1 >= totalPages }
        ]
    };

    return [
        {
            type: 17, accent_color: 42751,
            components: [
                { type: 10, content: `## Hub de Configurações - ${interaction.guild.name}` },
                { type: 10, content: premiumStatusText },
                { type: 14, divider: true, spacing: 2 },
                
                ...paginatedModules,
                
                { type: 14, divider: true, spacing: 2 },
                totalPages > 1 ? paginationButtons : null,
                { type: 14, divider: true, spacing: 1 },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 3, "label": "Ativar Key", "custom_id": "main_ativar_key" },
                        { type: 2, style: 1, "label": "Estatísticas", "emoji": { "name": "📊" }, "disabled": !hasStatsAccess, "custom_id": "main_show_stats" }
                    ]
                },
                { type: 14, "divider": true, "spacing": 1 },
                { type: 10, content: " ↘   Conheça tambem o PoliceFlow e FactionFlow! 🥇" }
            ].filter(Boolean)
        }
    ];
}