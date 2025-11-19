module.exports = function generateDevGuildsMenu(guildsData, page = 0, totals, sortType = 'default') {
    // Reduzido para 4 para evitar o erro COMPONENT_MAX_TOTAL_COMPONENTS_EXCEEDED
    const ITEMS_PER_PAGE = 4; 
    
    const totalPages = Math.ceil(guildsData.length / ITEMS_PER_PAGE);
    const start = page * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const currentGuilds = guildsData.slice(start, end);

    // Cabeçalho com estatísticas
    const headerComponent = {
        type: 10,
        content: `## 🎛️ Gerenciamento de Servidores (${guildsData.length})\n` +
                 `> 🟢 **Ativos:** ${totals.active} | 🔧 **Manutenção:** ${totals.maintenance} | 💎 **Premium:** ${totals.premium}`
    };

    const guildComponents = [];

    // Gerar componentes para cada guilda da página atual
    for (const guild of currentGuilds) {
        // Tratamento seguro de dados
        const memberCount = guild.memberCount ? guild.memberCount.toLocaleString('pt-BR') : 'N/A';
        
        let joinedDate = 'Data desconhecida';
        if (guild.joinedAt) {
            try {
                joinedDate = new Date(guild.joinedAt).toLocaleDateString('pt-BR');
            } catch (e) {
                joinedDate = 'Erro na data';
            }
        }

        const statusIcons = [];
        if (guild.isPremium) statusIcons.push("💎");
        if (guild.maintenance) statusIcons.push("🔧");
        const statusStr = statusIcons.length > 0 ? statusIcons.join(' ') : "Normal";

        // Componentes da Guilda OTIMIZADOS (Combinando Título e Info em um bloco)
        guildComponents.push(
            { type: 14, divider: true, spacing: 2 },
            {
                type: 10,
                // Combinando Título e Detalhes para economizar componentes
                content: `### ${guild.name}\n` +
                         `🆔 \`${guild.id}\` • 👥 **${memberCount}** • 📅 **${joinedDate}**\n` +
                         `🔰 **Status:** ${statusStr}`
            },
            {
                type: 1, // Container de Botões
                components: [
                    {
                        type: 2,
                        style: 1,
                        label: "Gerenciar",
                        custom_id: `dev_guild_manage_select_${guild.id}`,
                        disabled: false
                    },
                    {
                        type: 2,
                        style: 4, // Vermelho
                        label: "Sair",
                        custom_id: `dev_guild_force_leave_${guild.id}`,
                        disabled: false
                    }
                ]
            }
        );
    }

    // Botões de Paginação
    const paginationButtons = {
        type: 1,
        components: [
            {
                type: 2,
                style: 2,
                label: "◀ Anterior",
                custom_id: `dev_guilds_page_${page - 1}`,
                disabled: page === 0
            },
            {
                type: 2,
                style: 2,
                label: `Página ${page + 1}/${totalPages || 1}`,
                custom_id: "dev_guilds_page_counter",
                disabled: true
            },
            {
                type: 2,
                style: 2,
                label: "Próxima ▶",
                custom_id: `dev_guilds_page_${page + 1}`,
                disabled: page + 1 >= totalPages
            }
        ]
    };

    // Botões de Ação Global (Rodapé)
    const footerActions = {
        type: 1,
        components: [
            { type: 2, style: 2, label: "Voltar ao Menu", custom_id: "dev_main_menu_back" },
            { type: 2, style: 1, label: "Atualizar Lista", custom_id: "dev_manage_guilds" }
        ]
    };

    return [
        {
            type: 17,
            components: [
                headerComponent,
                ...guildComponents,
                { type: 14, divider: true, spacing: 2 },
                paginationButtons,
                { type: 14, divider: true, spacing: 1 },
                footerActions
            ]
        }
    ];
};