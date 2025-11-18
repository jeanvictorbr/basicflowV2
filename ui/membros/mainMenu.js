// File: ui/membros/mainMenu.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

function getMemberManagementMenu(members, total, page, scope, isDev) {
    const totalPages = Math.ceil(total / 10);
    const isGuildScope = scope === 'GUILD';

    const title = isGuildScope ? '## 👥 Gerenciador de Membros Verificados' : '## 🌎 Gerenciador Global de Usuários (DEV)';
    const description = members.length
        ? members.map(m => `• <@${m.user_id}> (${m.username} - \`${m.user_id}\`)`).join('\n')
        : '> Nenhum membro encontrado.';

    const footer = `Exibindo ${members.length} de ${total} membros. Página ${page + 1} / ${totalPages > 0 ? totalPages : 1}`;

    // Componentes V2
    const v2_components = [
        { "type": 10, "content": title },
        { "type": 10, "content": description },
        { "type": 14, "divider": true, "spacing": 1 },
        { "type": 10, "content": `> ${footer}` }, // Footer como texto
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
        const userSelectOptions = members.map(m => ({
            label: m.username,
            value: m.user_id,
            description: `ID: ${m.user_id}`,
        }));

        v2_components.push({
            type: 1, // Action Row
            components: [
                {
                    type: 3, // String Select
                    custom_id: `membros_select_user_${scope}`,
                    placeholder: 'Selecionar membro para gerenciar...',
                    options: userSelectOptions,
                },
            ],
        });
    }

    // Botões de Ação (Transferir e Voltar)
    // Só mostramos o botão de transferir se houver membros para transferir
    if (members.length > 0) {
        v2_components.push({
            type: 1, // Action Row
            components: [
                {
                    type: 2, // Button
                    style: 1, // Primary
                    label: 'Transferir em Massa',
                    emoji: { name: '🚀' },
                    custom_id: `membros_mass_transfer_${scope}`, // Apenas 'GUILD' por enquanto
        
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

    // --- NOVO BOTÃO DE VOLTAR ADICIONADO ---
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