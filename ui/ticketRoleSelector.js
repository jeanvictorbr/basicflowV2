// ui/ticketRoleSelector.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function ticketRoleSelector(deptName, allRoles, selectedRoleIds, page = 0) {
    const ROLES_PER_PAGE = 12; // 4 linhas x 3 botões
    const totalPages = Math.ceil(allRoles.length / ROLES_PER_PAGE);
    
    // Proteção de limites de página
    page = Math.max(0, Math.min(page, totalPages - 1));
    if (totalPages === 0) page = 0;

    // Pega os cargos da página atual
    const start = page * ROLES_PER_PAGE;
    const currentRoles = allRoles.slice(start, start + ROLES_PER_PAGE);

    const components = [];
    let currentRow = new ActionRowBuilder();

    // Cria os botões dos cargos
    currentRoles.forEach((role, index) => {
        const isSelected = selectedRoleIds.includes(role.id);
        
        const btn = new ButtonBuilder()
            .setCustomId(`tkt_role_toggle_${role.id}`)
            .setLabel(role.name.substring(0, 80)) // Limite do Discord
            .setStyle(isSelected ? ButtonStyle.Success : ButtonStyle.Secondary); // Verde se selecionado, Cinza se não

        currentRow.addComponents(btn);

        // Fecha a linha a cada 3 botões ou se acabou a lista
        if ((index + 1) % 3 === 0 || index === currentRoles.length - 1) {
            components.push(currentRow);
            currentRow = new ActionRowBuilder();
        }
    });

    // Cria a barra de navegação (Anterior | Info | Próximo | Salvar)
    const navRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`tkt_role_nav_prev_${page}`)
            .setLabel('◀ Anterior')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),
        
        new ButtonBuilder()
            .setCustomId('ignore_info')
            .setLabel(`${page + 1}/${totalPages || 1}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),

        new ButtonBuilder()
            .setCustomId(`tkt_role_nav_next_${page}`)
            .setLabel('Próximo ▶')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page >= totalPages - 1),

        new ButtonBuilder()
            .setCustomId('tkt_role_save')
            .setLabel(`💾 Salvar (${selectedRoleIds.length})`)
            .setStyle(ButtonStyle.Success)
    );

    components.push(navRow);

    // Formata a lista de texto para o Embed
    const selectedMentions = selectedRoleIds.length > 0 
        ? selectedRoleIds.map(id => `<@&${id}>`).join(', ')
        : 'Nenhum selecionado';

    return {
        content: '', // V2 Clean
        embeds: [
            {
                title: `🛠️ Configurando: ${deptName}`,
                description: 'Selecione os cargos que terão acesso a este departamento clicando nos botões abaixo.\nOs botões **Verdes** indicam cargos selecionados.',
                color: 0x2b2d31,
                fields: [
                    {
                        name: 'Cargos Selecionados',
                        value: selectedMentions.substring(0, 1024)
                    }
                ]
            }
        ],
        components: components, // A grade de botões
        ephemeral: true
    };
};