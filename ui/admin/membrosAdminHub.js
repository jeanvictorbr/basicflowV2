// File: ui/admin/membrosAdminHub.js
// CONTEÚDO COMPLETO E CORRIGIDO COM PAGINAÇÃO

const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
const { getGuilds } = require('../../utils/devPanelUtils.js');

// Função auxiliar para formatar opções
function formatarOpcoes(guilds) {
    if (!guilds || guilds.length === 0) {
        return [{ label: "Nenhum servidor encontrado", value: "null", description: "Sem dados." }];
    }
    
    return guilds.map(guild => ({
        label: guild.name.substring(0, 100),
        value: guild.id,
        description: `ID: ${guild.id} | Membros: ${guild.memberCount}`.substring(0, 100)
    }));
}

// Agora aceita 'page' para controlar a lista de guildas comuns
async function getMembrosAdminHub(interaction, page = 0) {
    const client = interaction.client;
    let devGuilds = [];
    let allGuilds = [];

    try {
        const botGuilds = await getGuilds(client);
        devGuilds = botGuilds.devGuilds; // Geralmente são poucos, não precisa paginar
        allGuilds = botGuilds.allGuilds; // Estes precisam de paginação
    } catch (e) {
        console.error("Erro ao buscar guilds no Hub de Admin de Membros:", e);
    }

    // 1. Preparar Paginação para 'allGuilds'
    // Ordenar por membros (maiores primeiro) para facilitar
    allGuilds.sort((a, b) => b.memberCount - a.memberCount);

    const ITEMS_PER_PAGE = 25;
    const totalPages = Math.ceil(allGuilds.length / ITEMS_PER_PAGE);
    
    // Garantir que a página está dentro dos limites
    if (page < 0) page = 0;
    if (page >= totalPages && totalPages > 0) page = totalPages - 1;

    const start = page * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    
    // Pegar a fatia atual (ex: 0 a 25, 25 a 50...)
    const currentAllGuilds = allGuilds.slice(start, end);

    // 2. Gerar Opções
    const devGuildOptions = formatarOpcoes(devGuilds.slice(0, 25)); // Limitamos DEV a 25 por segurança
    const allGuildOptions = formatarOpcoes(currentAllGuilds);

    // 3. Montar Componentes
    const v2_components = [
        {
            "type": 10,
            "content": "## 🔒 Hub de Administração de Membros (DEV)"
        },
        {
            "type": 10,
            "content": "> Gerenciamento global de usuários verificados via OAuth2."
        },
        { "type": 14, "divider": true, "spacing": 1 },
        {
            "type": 1, // Botões de Topo
            "components": [
                {
                    "type": 2, "style": 1, "label": "Ver Todos (Global)",
                    "custom_id": "membros_view_all", "emoji": { "name": "🌍" }
                },
                {
                    "type": 2, "style": 2, "label": "Pesquisar (Guilda Atual)",
                    "custom_id": "membros_view_guild", "emoji": { "name": "🔍" }
                },
                {
                    "type": 2, "style": 2, "label": "Transferir por ID",
                    "custom_id": "membros_transfer_manual_id", "emoji": { "name": "🆔" }
                }
            ]
        },
        { "type": 14, "divider": true, "spacing": 2 },
        
        // SEÇÃO 1: GUILDAS DE DEV (Sem paginação complexa, assume-se < 25)
        {
            "type": 10,
            "content": "### 📤 Transferência (Origem: Servidores DEV)"
        },
        {
            "type": 1, 
            "components": [
                {
                    "type": 3, 
                    "custom_id": "membros_mass_transfer_DEV",
                    "placeholder": "Selecione uma Guilda de DEV...",
                    "options": devGuildOptions
                }
            ]
        },
        { "type": 14, "divider": true, "spacing": 1 },

        // SEÇÃO 2: TODAS AS GUILDAS (Com Paginação)
        {
            "type": 10,
            "content": `### 📥 Transferência (Origem: Qualquer Servidor)\nExibindo ${start + 1}-${Math.min(end, allGuilds.length)} de ${allGuilds.length} servidores.`
        },
        {
            "type": 1, 
            "components": [
                {
                    "type": 3, 
                    "custom_id": "membros_mass_transfer_ALL",
                    "placeholder": `Selecione uma Guilda (Página ${page + 1}/${totalPages || 1})...`,
                    "options": allGuildOptions
                }
            ]
        },
        // BOTÕES DE NAVEGAÇÃO PARA O MENU ACIMA
        {
            "type": 1,
            "components": [
                {
                    "type": 2, "style": 2, "label": "◀ Anterior",
                    "custom_id": `membros_guild_page_${page - 1}`,
                    "disabled": page === 0
                },
                {
                    "type": 2, "style": 2, "label": `Página ${page + 1}/${totalPages || 1}`,
                    "custom_id": "noop_counter", "disabled": true
                },
                {
                    "type": 2, "style": 2, "label": "Próxima ▶",
                    "custom_id": `membros_guild_page_${page + 1}`,
                    "disabled": page + 1 >= totalPages
                }
            ]
        }
    ];

    return {
        type: 17,
        flags: V2_FLAG | EPHEMERAL_FLAG,
        accent_color: 0xED4245, // Red
        components: v2_components
    };
}

module.exports = { getMembrosAdminHub };