// ui/ticketRoleSelectMenu.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function ticketRoleSelectMenu(deptName, allRoles, selectedRoleIds, page = 0) {
    const ROLES_PER_PAGE = 25; // Limite máximo do Discord para Select Menu
    const totalPages = Math.ceil(allRoles.length / ROLES_PER_PAGE);
    
    // Ajusta limites da página
    page = Math.max(0, Math.min(page, totalPages - 1));
    if (totalPages === 0) page = 0;

    // Fatia os cargos para a página atual
    const start = page * ROLES_PER_PAGE;
    const currentRoles = allRoles.slice(start, start + ROLES_PER_PAGE);

    // 1. Cria as opções do Menu baseadas nos cargos
    const options = currentRoles.map(role => ({
        label: role.name.substring(0, 100),
        value: role.id,
        // Se o ID estiver na lista global de selecionados, marca como padrão
        default: selectedRoleIds.includes(role.id),
        emoji: '🛡️'
    }));

    // Se não houver cargos (servidor vazio?), evita erro
    if (options.length === 0) {
        options.push({ label: 'Nenhum cargo encontrado', value: 'none', default: false });
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_ticket_dept_roles')
        .setPlaceholder(`Página ${page + 1}/${Math.max(1, totalPages)} - Selecione os cargos...`)
        .setMinValues(0) // Permite desmarcar tudo
        .setMaxValues(options.length) // Permite marcar todos da página
        .addOptions(options);

    // 2. Botões de Navegação e Salvar
    const buttons = [
        new ButtonBuilder()
            .setCustomId(`tkt_role_menu_nav_prev_${page}`)
            .setLabel('◀ Anterior')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0),
        
        new ButtonBuilder()
            .setCustomId('tkt_role_menu_save')
            .setLabel(`✅ Salvar e Criar (${selectedRoleIds.length} selecionados)`)
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId(`tkt_role_menu_nav_next_${page}`)
            .setLabel('Próximo ▶')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page >= totalPages - 1)
    ];

    // Formata lista para o embed
    const selectedMentions = selectedRoleIds.length > 0 
        ? selectedRoleIds.map(id => `<@&${id}>`).join(', ')
        : 'Nenhum cargo selecionado.';

    return {
        // Sem content para evitar erro V2
        embeds: [
            {
                title: `🛠️ Configurando: ${deptName}`,
                description: 'Utilize o menu abaixo para selecionar os cargos.\nVocê pode navegar entre as páginas; suas seleções ficarão salvas.',
                color: 0x5865F2, // Blurple
                fields: [
                    {
                        name: '📋 Cargos Atualmente Selecionados',
                        value: selectedMentions.substring(0, 1024)
                    }
                ]
            }
        ],
        components: [
            new ActionRowBuilder().addComponents(selectMenu),
            new ActionRowBuilder().addComponents(buttons)
        ],
        ephemeral: true
    };
};