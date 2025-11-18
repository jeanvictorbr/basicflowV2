// ui/automations/massRolesMenu.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

async function buildMassRolesMenu() {

    const payload = {
        type: 17,
        accent_color: 42751,
        components: [
            {
                type: 10,
                content: "## 🏷️ Cargos em Massa"
            },
            {
                type: 10,
                content: "Execute ações de atribuição de cargos em massa para todos os membros do servidor.\n**Use com extremo cuidado.** Esta ação é irreversível e pode demorar."
            },

            // --- Ações ---
            { type: 14, divider: true, spacing: 2 },
            {
                type: 1,
                components: [
                    {
                        type: 2, style: 1, // Azul
                        label: 'Adicionar a Todos',
                        emoji: { name: '➕' },
                        custom_id: 'aut_mass_add_role_start'
                    },
                    {
                        type: 2, style: 4, // Vermelho
                        label: 'Remover de Todos',
                        emoji: { name: '➖' },
                        custom_id: 'aut_mass_remove_role_start'
                    },
                ]
            },
            {
                type: 1,
                components: [
                     {
                        type: 2, style: 2, // Cinza
                        label: 'Adicionar (Apenas Membros sem Cargo)',
                        emoji: { name: '👤' },
                        custom_id: 'aut_mass_add_role_noroles_start'
                    }
                ]
            },
            
            // --- Rodapé ---
            { type: 14, divider: true, spacing: 2 },
            {
                type: 1,
                components: [
                    {
                        type: 2, style: 2, label: 'Voltar',
                        emoji: { name: '⬅️' }, custom_id: 'open_automations_menu'
                    }
                ]
            }
        ]
    };

    // --- CORREÇÃO AQUI ---
    // Retornamos o payload V2 diretamente. 
    // A função interaction.update() do d.js não aceita o wrapper { type: 4, data: ... }.
    return {
        ...payload,
        flags: EPHEMERAL_FLAG | V2_FLAG
    };
    // --- FIM DA CORREÇÃO ---
}

module.exports = buildMassRolesMenu;