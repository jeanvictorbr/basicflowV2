module.exports = function generateDevGuildsMenu(guildsData, page = 0, totals, sortType = 'default') {
    const ITEMS_PER_PAGE = 4; // Mantido em 4 para segurança
    const totalPages = Math.ceil(guildsData.length / ITEMS_PER_PAGE);
    const start = page * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const currentGuilds = guildsData.slice(start, end);

    // Cabeçalho com estatísticas
    const headerComponent = {
        type: 10,
        content: `## 🎛️ Gerenciamento Avançado (${guildsData.length})\n` +
                 `> 📊 **Status:** ${totals.active} Ativos | 💎 ${totals.premium} Premium\n` +
                 `> 🔎 **Ordenação Atual:** \`${sortType === 'inactive' ? '💀 Inativos (Fantasmas)' : sortType === 'active' ? '🔥 Mais Ativos' : '👥 Membros (Padrão)'}\``
    };

    const guildComponents = [];

    for (const guild of currentGuilds) {
        const memberCount = guild.memberCount ? guild.memberCount.toLocaleString('pt-BR') : 'N/A';
        
        // Formatação de Data de Entrada
        let joinedDate = 'N/A';
        if (guild.joinedAt) {
            try { joinedDate = new Date(guild.joinedAt).toLocaleDateString('pt-BR'); } catch (e) {}
        }

        // Formatação de Última Atividade
        let lastActiveStr = "💤 **Nunca/Sem Logs**";
        if (guild.lastActiveTimestamp > 0) {
            const date = new Date(guild.lastActiveTimestamp);
            // Se foi hoje, mostra hora, senão mostra data
            const isToday = new Date().toDateString() === date.toDateString();
            lastActiveStr = isToday 
                ? `🕒 Hoje às ${date.toLocaleTimeString('pt-BR')}` 
                : `📅 ${date.toLocaleDateString('pt-BR')}`;
        }

        // Formatação de Features
        const featuresList = guild.features.length > 0 
            ? guild.features.map(f => `\`${f}\``).join(', ') 
            : "❌ Nenhuma Key Ativa";

        // Status Icons
        let statusIcons = "";
        if (guild.isPremium) statusIcons += "💎 ";
        if (guild.maintenance) statusIcons += "🔧 ";
        if (guild.totalInteractions > 1000) statusIcons += "🔥 ";
        if (guild.totalInteractions === 0) statusIcons += "👻 ";

        guildComponents.push(
            { type: 14, divider: true, spacing: 2 },
            {
                type: 10,
                content: `### ${statusIcons}${guild.name}\n` +
                         `🆔 \`${guild.id}\` • 👑 <@${guild.ownerId}>\n` +
                         `👥 **Membros:** ${memberCount} • 📥 **Entrou:** ${joinedDate}\n` +
                         `📡 **Última Ação:** ${lastActiveStr} (Total: ${guild.totalInteractions})\n` +
                         `🔑 **Licença:** ${featuresList}`
            },
            {
                type: 1,
                components: [
                    { type: 2, style: 1, label: "Gerenciar", custom_id: `dev_guild_manage_select_${guild.id}` },
                    { type: 2, style: 4, label: "Force Leave", custom_id: `dev_guild_force_leave_${guild.id}` }
                ]
            }
        );
    }

    const paginationButtons = {
        type: 1,
        components: [
            { type: 2, style: 2, label: "◀", custom_id: `dev_guilds_page_${page - 1}_${sortType}`, disabled: page === 0 },
            { type: 2, style: 2, label: `${page + 1}/${totalPages || 1}`, custom_id: "noop", disabled: true },
            { type: 2, style: 2, label: "▶", custom_id: `dev_guilds_page_${page + 1}_${sortType}`, disabled: page + 1 >= totalPages }
        ]
    };

    // Menu de Ordenação (Botões coloridos para facilitar)
    const sortButtons = {
        type: 1,
        components: [
            { type: 2, style: sortType === 'default' ? 3 : 2, label: "Membros", emoji: { name: "👥" }, custom_id: "dev_guilds_sort_default" },
            { type: 2, style: sortType === 'active' ? 3 : 2, label: "Mais Ativos", emoji: { name: "🔥" }, custom_id: "dev_guilds_sort_active" },
            { type: 2, style: sortType === 'inactive' ? 4 : 2, label: "Inativos (Limpeza)", emoji: { name: "💀" }, custom_id: "dev_guilds_sort_inactive" },
            { type: 2, style: 1, label: "↻", custom_id: "dev_manage_guilds" } // Refresh simples
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
                sortButtons,
                { type: 1, components: [{ type: 2, style: 2, label: "Voltar ao Menu", custom_id: "dev_main_menu_back" }] }
            ]
        }
    ];
};