// Em: config/features.js
// (Este é o seu arquivo original, com a nova feature 'AUTOMATIONS' adicionada no final)

const FEATURES = [
    { value: 'ALL', label: 'Todas as Features (ALL)' },
    { value: 'STATS', label: 'Estatísticas (/stats)' },
    { value: 'ARQUITETO', label: 'Arquiteto IA (/arquiteto)' },
    { value: 'GUARDIAN_AI', label: 'Guardian AI (Moderação IA)' },
    { value: 'AI_ASSISTANT', label: 'Assistente IA (Tickets/Chat)' },
    { value: 'ADVANCED_LOGS', label: 'Logs Avançados' },
    { value: 'CUSTOM_VISUALS', label: 'Visuais Customizados (Embeds)' },
    { value: 'REGISTROS', label: 'Sistema de Registros' },
    { value: 'AUSENCIAS', label: 'Sistema de Ausências' },
    { value: 'PONTO', label: 'Sistema de Ponto (Básico)' },
    { value: 'ADVANCED_PONTO', label: 'Sistema de Ponto (Avançado)' },
    { value: 'STORE', label: 'Módulo de Loja (StoreFlow)' },
    { value: 'STORE_DM_FLOW', label: 'Loja com Fluxo DM' },
    { value: 'TICKET_DM_FLOW', label: 'Ticket com Fluxo DM' },
    { value: 'UNIFORMES', label: 'Sistema de Uniformes' },
    { value: 'ADVANCED_MOD', label: 'Moderação Avançada' },
    { value: 'ROLE_TAGS', label: 'Tags por Cargo (RoleTags)' },
    { value: 'SUGGESTIONS', label: 'Sistema de Sugestões' },
    // --- CORREÇÃO ADICIONADA AQUI ---
    { value: 'AUTOMATIONS', label: 'Módulo de Automatizações' } 
];

module.exports = FEATURES;