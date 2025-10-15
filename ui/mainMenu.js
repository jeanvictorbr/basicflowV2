// Substitua o conteúdo em: ui/mainMenu.js
const hasFeature = require('../utils/featureCheck.js');
const db = require('../database.js');
const FEATURES = require('../config/features.js');

module.exports = async function generateMainMenu(interaction, page = 0) {
    const FEATURES_MAP = new Map(FEATURES.map(f => [f.value, f.label]));

    const botStatusResult = await db.query("SELECT * FROM bot_status WHERE status_key = 'main'");
    const botStatus = botStatusResult.rows[0];
    const aiMaintenanceNotice = (botStatus && !botStatus.ai_services_enabled)
        ? { "type": 10, "content": "⚠️ **Aviso do Desenvolvedor:** Os serviços de IA (Guardian, Resumos, Chat) estão temporariamente em manutenção e não funcionarão." }
        : null;

    const activeFeaturesResult = await db.query(
        "SELECT feature_key, expires_at, activated_by_key FROM guild_features WHERE guild_id = $1 AND expires_at > NOW() ORDER BY expires_at ASC",
        [interaction.guild.id]
    );

    let premiumStatusText = `> ✨ **Status da Licença:** Inativa\n> 💡 Ative uma chave para liberar funcionalidades exclusivas!`;

    if (activeFeaturesResult.rows.length > 0) {
        const groupedFeatures = {};
        
        activeFeaturesResult.rows.forEach(feature => {
            const key = feature.activated_by_key || `legacy_${feature.expires_at.toISOString()}`;
            if (!groupedFeatures[key]) {
                groupedFeatures[key] = {
                    features: [],
                    expires_at: feature.expires_at
                };
            }
            groupedFeatures[key].features.push(feature.feature_key);
        });

        premiumStatusText = `> ✨ **Status da Licença:** Ativa\n\n`;
        const packages = [];
        const singleFeatures = [];

        for (const key in groupedFeatures) {
            const group = groupedFeatures[key];
            const formattedDate = new Date(group.expires_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            
            const featuresList = group.features.map(f => `\`${FEATURES_MAP.get(f) || f}\``).join(', ');

            if (group.features.length > 1 || group.features.includes('ALL')) {
                packages.push(`> 📦 **Pacote de Funções** (Expira em: ${formattedDate})\n>    └─ Acessos: ${featuresList}`);
            } else {
                singleFeatures.push(`> 🔑 **Função Individual** (Expira em: ${formattedDate})\n>    └─ Acesso: ${featuresList}`);
            }
        }
        
        if (packages.length > 0) {
            premiumStatusText += "**PACOTES FECHADOS:**\n" + packages.join('\n\n') + '\n\n';
        }
        if (singleFeatures.length > 0) {
            premiumStatusText += "**FUNÇÕES SEPARADAS:**\n" + singleFeatures.join('\n');
        }
    }
    
    const hasGuardianAccess = await hasFeature(interaction.guild.id, 'GUARDIAN_AI');
    const hasStatsAccess = await hasFeature(interaction.guild.id, 'STATS');
    const hasArchitectAccess = await hasFeature(interaction.guild.id, 'ARQUITETO'); // <-- VERIFICAÇÃO DA NOVA FEATURE

    const allModules = [
        {
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "🏗️" }, custom_id: "open_architect_menu", disabled: !hasArchitectAccess },
            components: [{ type: 10, content: "🏗️ Arquiteto de Servidor (IA)" }, { type: 10, content: "Deixe a IA construir e organizar o seu servidor. `requer chave especifica`" }]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "➕" }, custom_id: "open_ausencias_menu" },
            components: [{ type: 10, content: "🏖️ Ausências" }, { type: 10, content: "Configure todo o sistema de **ausências**." }]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "➕" }, custom_id: "open_welcome_menu",disabled: "true" },
            components: [{ type: 10, content: "👋 Boas-Vindas" }, { type: 10, content: "Configure as mensagens de entrada e saída." }]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "➕" }, custom_id: "open_registros_menu" },
            components: [{ type: 10, content: "📂 Registros" }, { type: 10, content: "Configure todo o sistema de **registros**." }]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "➕" }, custom_id: "open_tickets_menu" },
            components: [{ type: 10, content: "🚨 Tickets" }, { type: 10, content: "Configure todo o sistema de **tickets**." }]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "➕" }, custom_id: "open_moderacao_menu" },
            components: [{ type: 10, content: "⚖️ Moderação" }, { type: 10, content: "Configure as ferramentas da sua **equipa de staff**." }]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "➕" }, custom_id: "open_uniformes_menu" },
            components: [{ type: 10, content: "👔 Uniformes" }, { type: 10, content: "Configure todo o sistema de **uniformes**." }]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "➕" }, custom_id: "open_ponto_menu" },
            components: [{ type: 10, content: "⏰ Bate-Ponto" }, { type: 10, content: "Configure todo o sistema de **bate-ponto**." }]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "➕" }, custom_id: "open_store_menu" },
            components: [{ type: 10, content: "🏪 Loja (StoreFlow)" }, { type: 10, content: "Gerencie os produtos e vendas da sua loja." }]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "➕" }, custom_id: "open_suggestions_menu" },
            components: [{ type: 10, content: "💡 Sugestões" }, { type: 10, content: "Gerencie as **sugestões da comunidade**." }]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "➕" }, custom_id: "open_guardian_menu", disabled: !hasGuardianAccess },
            components: [{ type: 10, content: "🛡️ Guardian AI (Premium)" }, { type: 10, content: "Moderação proativa para **prevenir conflitos**." }]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "➕" }, custom_id: "open_minigames_hub" },
            components: [{ type: 10, content: "🎲 Mini-Games" }, { type: 10, content: "Configure e gerencie os jogos do servidor." }]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, accessory: { type: 2, style: 2, label: "Abrir", emoji: { name: "➕" }, custom_id: "open_roletags_menu" },
            components: [{ type: 10, content: "🏷️ Tags por Cargo (RoleTags)" }, { type: 10, content: "Aplique tags aos apelidos baseadas em cargos." }]
        },
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
            "type": 17, "accent_color": 42751,
            "components": [
                { type: 10, "content": `## Hub de Configurações - ${interaction.guild.name}` },
                aiMaintenanceNotice,
                aiMaintenanceNotice ? { "type": 14, "divider": true, "spacing": 1 } : null,
                { type: 10, "content": premiumStatusText },
                { type: 14, "divider": true, "spacing": 2 },
                
                ...paginatedModules,
                
                { type: 14, "divider": true, "spacing": 2 },
                totalPages > 1 ? paginationButtons : null,
                { type: 14, "divider": true, "spacing": 1 },
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": 3, "label": "Ativar Key", "custom_id": "main_ativar_key" },
                        { "type": 2, "style": 1, "label": "Atualizações", "emoji": { "name": "📢" }, "disabled": "false", "custom_id": "open_updates_menu" },
                        { "type": 2, "style": 1, "label": "Estatísticas", "emoji": { "name": "📊" }, "disabled": !hasStatsAccess, "custom_id": "main_show_stats" }
                    ]
                },
                { type: 14, "divider": true, "spacing": 1 },
                { type: 10, "content": " ↘   Conheça tambem o PoliceFlow e FactionFlow! 🥇" }
            ].filter(Boolean)
        }
    ];
}