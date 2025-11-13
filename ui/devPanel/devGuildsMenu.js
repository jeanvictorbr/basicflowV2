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
            if (guild.mod_log_channel) activeModules.push('Moderação');
            if (guild.ausencias_canal_aprovacoes) activeModules.push('Ausências');
            if (guild.uniformes_vitrine_channel_id) activeModules.push('Uniformes');
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

    const sortRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`dev_guilds_sort_default`).setLabel('Padrão').setStyle(ButtonStyle.Secondary).setDisabled(sortKey === 'default'),
        new ButtonBuilder().setCustomId(`dev_guilds_sort_members`).setLabel('Membros').setStyle(ButtonStyle.Secondary).setDisabled(sortKey === 'members'),
        new ButtonBuilder().setCustomId(`dev_guilds_sort_ai_usage`).setLabel('Uso de IA').setStyle(ButtonStyle.Secondary).setDisabled(sortKey === 'ai_usage'),
        new ButtonBuilder().setCustomId(`dev_guilds_sort_expiry`).setLabel('Expiração').setStyle(ButtonStyle.Secondary).setDisabled(sortKey === 'expiry')
    );
    
    const manageButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('dev_guild_manage_select').setLabel('Gerenciar Guilda').setStyle(ButtonStyle.Primary).setEmoji('⚙️').setDisabled(allGuildData.length === 0),
        // CORREÇÃO: custom_id alterado para 'dev_main_menu_back'
        new ButtonBuilder().setCustomId('dev_main_menu_back').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji('↩️')
    );

    const massDmButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('dev_guilds_send_dm_all').setLabel('DM Donos').setStyle(ButtonStyle.Secondary).setEmoji('📣').setDisabled(allGuildData.length === 0),
        new ButtonBuilder().setCustomId('dev_guilds_send_dm_all_users').setLabel('DM Global (Membros)').setStyle(ButtonStyle.Danger).setEmoji('🗣️').setDisabled(allGuildData.length === 0)
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
                { "type": 1, "components": manageButtons.toJSON().components },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "> **Ações em Massa (CUIDADO):**" },
                { "type": 1, "components": massDmButtons.toJSON().components }
            ].filter(Boolean)
        }
    ];
};