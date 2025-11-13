// Substitua o conteúdo em: config/modules.js
const MODULES = [
    {
        name: 'StoreFlow',
        check: (id) => id.startsWith('store_') || id.startsWith('modal_store_') || id.startsWith('select_store_') || id === 'open_store_menu'
    },
    {
        name: 'Tickets',
        check: (id) => id.startsWith('ticket_') || id.startsWith('tickets_') || id.startsWith('modal_ticket_') || id.startsWith('select_ticket_') || id.startsWith('feedback_') || id === 'open_tickets_menu'
    },
    {
        name: 'Bate-Ponto',
        check: (id) => id.startsWith('ponto_') || id.startsWith('modal_ponto_') || id.startsWith('select_ponto_') || id.startsWith('ranking_page_') || id === 'open_ponto_menu'
    },
    {
        name: 'Moderação',
        check: (id) => id.startsWith('mod_') || id.startsWith('modal_mod_') || id.startsWith('select_mod_') || ['ban', 'kick', 'timeout', 'warn', 'dossie', 'open_moderacao_menu'].includes(id)
    },
    {
        name: 'GuardianAI',
        check: (id) => id.startsWith('guardian_') || id.startsWith('modal_guardian_') || id.startsWith('select_guardian_') || id === 'debugai' || id === 'open_guardian_menu'
    },
    {
        name: 'Sugestões',
        check: (id) => id.startsWith('suggestion_') || id.startsWith('suggestions_') || id.startsWith('modal_suggestion_') || id.startsWith('select_suggestion_') || id === 'open_suggestions_menu'
    },
    { // <-- ADICIONE ESTE BLOCO INTEIRO
        name: 'AUTOMATIONS',
        check: (id) => id.startsWith('aut_') || id.startsWith('open_automations_menu') || id.startsWith('automations_')
    },
    {
        name: 'Registros',
        check: (id) => id.startsWith('registros_') || id.startsWith('modal_registro_') || id.startsWith('select_registros_') || id === 'open_registros_menu'
    },
    {
        name: 'Ausências',
        check: (id) => id.startsWith('ausencia_') || id.startsWith('modal_ausencia_') || id.startsWith('select_ausencia_') || id === 'open_ausencias_menu'
    },
    {
        name: 'RoleTags',
        check: (id) => id.startsWith('roletags_') || id.startsWith('modal_roletags_') || id.startsWith('select_roletags_') || id === 'open_roletags_menu'
    },
    {
        name: 'Atualizações',
        check: (id) => id.startsWith('updates_') || id.startsWith('select_updates_') || id === 'open_updates_menu'
    },
    {
        name: 'Mini-Games',
        check: (id) => id.startsWith('hangman_') || id.startsWith('stop_') || ['forca', 'stop-categorias', 'ranking', 'open_minigames_hub'].includes(id)
    },
    {
        name: 'Uniformes',
        check: (id) => id.startsWith('uniformes_') || id.startsWith('modal_uniformes_') || id.startsWith('select_uniforme_') || id === 'open_uniformes_menu'
    },
    {
        name: 'Boas-Vindas',
        check: (id) => id.startsWith('welcome_') || id.startsWith('goodbye_') || id.startsWith('modal_welcome_') || id.startsWith('select_welcome_') || id === 'open_welcome_menu'
    },
    // <-- NOVO MÓDULO ADICIONADO AQUI -->
    {
        name: 'Arquiteto',
        check: (id) => id.startsWith('architect_') || id.startsWith('modal_architect_') || id === 'arquiteto' || id === 'open_architect_menu'
    }
];

module.exports = MODULES;