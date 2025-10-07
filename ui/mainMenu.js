// ui/mainMenu.js
const isPremiumActive = require('../utils/premiumCheck.js');
const db = require('../database.js');

module.exports = async function generateMainMenu(interaction, page = 0) {
    const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
    const isPremium = await isPremiumActive(interaction.guild.id);

    let premiumStatusText;
    if (isPremium) {
        const expiresAt = new Date(settings.premium_expires_at);
        const formattedDate = expiresAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        premiumStatusText = `> ✨ **Status Premium:** Ativo\n> 📅 **Expira em:** ${formattedDate}`;
    } else {
        premiumStatusText = `> ✨ **Status Premium:** Inativo\n> 💡 Ative uma chave para liberar funcionalidades exclusivas!`;
    }

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
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "🛡️" }, custom_id: "open_guardian_menu", disabled: !isPremium },
            components: [{ type: 10, content: "🛡️ Guardian AI (Premium)" }, { type: 10, content: "Moderação proativa para **prevenir conflitos**." }]
        }
        // --- FIM DA PÁGINA 2 ---
    ];

    // AQUI ESTÁ A MUDANÇA
    const ITEMS_PER_PAGE = 3; 

    // A lógica abaixo agrupa os itens e divisórias corretamente.
    // Cada "módulo" na verdade são 2 itens no array (o acessório + a divisória).
    const itemsWithDividersPerPage = ITEMS_PER_PAGE * 2;
    const paginatedModules = allModules.slice(page * itemsWithDividersPerPage, (page + 1) * itemsWithDividersPerPage);
    // Remove a última divisória se ela for o último item da página, para economizar espaço
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
                        { type: 2, style: 3, label: "Ativar Key", custom_id: "main_ativar_key" },
                        { type: 2, style: 1, label: "Estatísticas", emoji: { name: "📊" }, disabled: !isPremium, custom_id: "main_show_stats" }
                    ]
                },
                { type: 14, divider: true, spacing: 1 },
                { type: 10, content: " ↘   Conheça tambem o PoliceFlow e FactionFlow! 🥇" }
            ].filter(Boolean)
        }
    ];
}