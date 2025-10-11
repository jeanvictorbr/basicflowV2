// Substitua o conteúdo em: ui/devPanel/devGuildsMenu.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const ITEMS_PER_PAGE = 2;

module.exports = function generateDevGuildsMenu(allGuildData, page = 0, totals, sortKey = 'default') {
    const totalPages = Math.ceil(allGuildData.length / ITEMS_PER_PAGE);
    const paginatedGuilds = allGuildData.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    const guildList = paginatedGuilds.length > 0
        ? paginatedGuilds.map(guild => {
            const expiresAt = guild.premium_expires_at ? `<t:${Math.floor(new Date(guild.premium_expires_at).getTime() / 1000)}:R>` : '`Inativa`';
            const cost = guild.total_cost.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            
            const activeModules = [];
            if (guild.tickets_configurado) activeModules.push('Tickets');
            if (guild.ponto_status) activeModules.push('Ponto');
            if (guild.registros_status) activeModules.push('Registros');
            if (guild.guardian_ai_enabled) activeModules.push('Guardian');
            if (guild.roletags_enabled) activeModules.push('RoleTags');
            if (guild.suggestions_enabled) activeModules.push('Sugestões');
            if (guild.store_enabled) activeModules.push(`Loja ${guild.store_premium ? '✨' : ''}`);
            const modulesText = activeModules.join(', ') || 'Nenhum';
            
            const activityText = `> 📊 **Atividade (30d):** 🎫 ${guild.activity_tickets} | 🛒 ${guild.activity_sales} | 💡 ${guild.activity_suggestions}`;

            return `> 🏢 **${guild.name}** (\`${guild.guild_id}\`)\n` +
                   `> ├─ 👑 **Dono:** \`${guild.ownerTag}\`\n` +
                   `> ├─ 👥 **Membros:** ${guild.memberCount}\n` +
                   `> ├─ ✨ **Licença Expira:** ${expiresAt}\n` +
                   `> ├─ ⚙️ **Módulos Ativos:** \`${modulesText}\`\n` +
                   `> ├─ ${activityText}\n` +
                   `> └─ 🤖 **Uso de IA:** \`${guild.total_tokens_used}\` tokens (${cost}) - Top: \`${guild.top_feature}\``;
        }).join('\n\n')
        : '> O bot não parece estar em nenhum servidor.';

    const paginationRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`dev_guilds_page_${page - 1}_${sortKey}`).setLabel('Anterior').setStyle(ButtonStyle.Primary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId(`dev_guilds_page_${page + 1}_${sortKey}`).setLabel('Próxima').setStyle(ButtonStyle.Primary).setDisabled(page + 1 >= totalPages)
    );

    // NOVOS BOTÕES DE ORDENAÇÃO
    const sortRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`dev_guilds_sort_default`).setLabel('Padrão').setStyle(ButtonStyle.Secondary).setDisabled(sortKey === 'default'),
        new ButtonBuilder().setCustomId(`dev_guilds_sort_members`).setLabel('Membros').setStyle(ButtonStyle.Secondary).setDisabled(sortKey === 'members'),
        new ButtonBuilder().setCustomId(`dev_guilds_sort_ai_usage`).setLabel('Uso de IA').setStyle(ButtonStyle.Secondary).setDisabled(sortKey === 'ai_usage'),
        new ButtonBuilder().setCustomId(`dev_guilds_sort_expiry`).setLabel('Expiração').setStyle(ButtonStyle.Secondary).setDisabled(sortKey === 'expiry')
    );

    return [
        {
            "type": 17, "accent_color": 3447003,
            "components": [
                { "type": 10, "content": "## 🏢 Gerenciador de Guildas" },
                { "type": 10, "content": `> Ordenado por: **${sortKey}**. Visualizando ${paginatedGuilds.length} de ${allGuildData.length} servidores. Página ${page + 1} de ${totalPages || 1}.` },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 1, "components": sortRow.toJSON().components },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": guildList },
                { "type": 14, "divider": true, "spacing": 2 },
                totalPages > 1 ? { "type": 1, "components": paginationRow.toJSON().components } : null,
                { "type": 1, "components": [
                    { "type": 2, "style": 1, "label": "Gerenciar Guilda", "emoji": { "name": "⚙️" }, "custom_id": "dev_guild_manage_select", "disabled": allGuildData.length === 0 },
                    { "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "devpanel" }
                ]}
            ].filter(Boolean)
        }
    ];
};