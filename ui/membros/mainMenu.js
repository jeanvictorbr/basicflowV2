// File: ui/membros/mainMenu.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

function getMemberManagementMenu(members, total, page, scope, isDev) {
    const totalPages = Math.ceil(total / 10);
    const isGuildScope = scope === 'GUILD';

    const title = isGuildScope ? '## 👥 Gerenciador de Membros Verificados' : '## 🌎 Gerenciador Global de Usuários (DEV)';
    
    // Gera a descrição (aqui pode ter mais de 25 linhas, é apenas texto)
    const description = members.length
        ? members.map(m => `• <@${m.user_id}> (${m.username} - \`${m.user_id}\`)`).join('\n')
        : '> Nenhum membro encontrado.';

    const footer = `Exibindo ${members.length} de ${total} membros. Página ${page + 1} / ${totalPages > 0 ? totalPages : 1}`;

    // Componentes V2
    const v2_components = [
        { "type": 10, "content": title },
        { "type": 10, "content": description },
        { "type": 14, "divider": true, "spacing": 1 },
        { "type": 10, "content": `> ${footer}` },
        { "type": 14, "divider": true, "spacing": 2 },
    ];
    
    // Paginação
    v2_components.push({
        type: 1, // Action Row
        components: [
            { type: 2, style: 2, label: 'Anterior', custom_id: `membros_page_${scope}_${page - 1}`, disabled: page === 0 },
            { type: 2, style: 2, label: 'Próxima', custom_id: `membros_page_${scope}_${page + 1}`, disabled: (page + 1) * 10 >= total },
        ],
    });

    // Menu de Seleção
    if (members.length > 0) {
        // --- CORREÇÃO AQUI ---
        // A API do Discord limita Select Menus a 25 opções.
        // Mesmo que 'members' tenha 50 itens, pegamos apenas os primeiros 25 para o menu.
        const safeOptions = members.slice(0, 25).map(m => ({
            label: (m.username || 'Sem Nome').substring(0, 100), // Limite de 100 caracteres
            value: m.user_id,
            description: `ID: ${m.user_id}`.substring(0, 100),
        }));

        v2_components.push({
            type: 1, // Action Row
            components: [
                {
                    type: 3, // String Select
                    custom_id: `membros_select_user_${scope}`,
                    placeholder: 'Selecionar membro para gerenciar...',
                    options: safeOptions, // Usamos a lista segura e cortada
                },
            ],
        });
    }

    // Botões de Ação (Transferir e Voltar)
    if (members.length > 0) {
        v2_components.push({
            type: 1, // Action Row
            components: [
                {
                    type: 2, // Button
                    style: 1, // Primary
                    label: 'Transferir em Massa',
                    emoji: { name: '🚀' },
                    custom_id: `membros_mass_transfer_${scope}`, 
                }
            ],
        });
    }

    // Botão DEV (Visão Global)
    if (isDev) {
        v2_components.push({
            type: 1, // Action Row
            components: [
                {
                    type: 2, // Button
                    style: isGuildScope ? 4 : 1, // Danger : Primary
                    label: isGuildScope ? 'Ver Todos (DEV)' : 'Ver Apenas da Guilda',
                    custom_id: isGuildScope ? 'membros_view_all' : 'membros_view_guild',
                }
            ],
        });
    }

    // Botão de Voltar
    v2_components.push({
        type: 1, // Action Row
        components: [
            {
                type: 2, // Button
                style: 2, // Secondary
                label: 'Voltar',
                emoji: { name: '⬅️' },
                custom_id: 'membros_back_to_oauth'
            }
        ]
    });

    return {
        type: 17,
        flags: V2_FLAG | EPHEMERAL_FLAG,
        accent_color: 0x5865F2, // Blurple
        components: v2_components
    };
}

module.exports = { getMemberManagementMenu };