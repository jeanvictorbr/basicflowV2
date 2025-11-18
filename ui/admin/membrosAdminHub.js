// File: ui/admin/membrosAdminHub.js
// CONTEÚDO COMPLETO E ATUALIZADO

const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
const db = require('../../database.js');
// Agora esta importação funciona
const { getGuilds } = require('../../utils/devPanelUtils.js');

// Função auxiliar
async function formatarGuilds(client, guilds) {
    if (!guilds || guilds.length === 0) {
        return [{ label: "Nenhum servidor encontrado", value: "null", description: "O bot não está em outros servidores." }];
    }
    return guilds.map(guild => ({
        label: guild.name,
        value: guild.id,
        description: `ID: ${guild.id} | Membros: ${guild.memberCount}`
    }));
}

async function getMembrosAdminHub(interaction) {
    const client = interaction.client;
    let devGuilds = [];
    let allGuilds = [];

    try {
        // Esta chamada agora funciona
        const botGuilds = await getGuilds(client);
        devGuilds = botGuilds.devGuilds;
        allGuilds = botGuilds.allGuilds;
    } catch (e) {
        console.error("Erro ao buscar guilds no Hub de Admin de Membros:", e);
    }

    const devGuildOptions = await formatarGuilds(client, devGuilds);
    const allGuildOptions = await formatarGuilds(client, allGuilds);

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
            "type": 1, // Action Row
            "components": [
                {
                    "type": 2, // Button
                    "style": 1, // Primary
                    "label": "Ver Todos os Membros (Global)",
                    "custom_id": "membros_view_all",
                    "emoji": { "name": "🌍" }
                },
                {
                    "type": 2, // Button
                    "style": 2, // Secondary
                    "label": "Pesquisar (Guilda Atual)",
                    "custom_id": "membros_view_guild",
                    "emoji": { "name": "🔍" }
                },
                // ===================================================================
                //  ⬇️  NOVO BOTÃO ADICIONADO AQUI (SUA SOLICITAÇÃO) ⬇️
                // ===================================================================
                {
                    "type": 2, // Button
                    "style": 2, // Secondary
                    "label": "Transferir por ID",
                    "custom_id": "membros_transfer_manual_id",
                    "emoji": { "name": "🆔" }
                }
                // ===================================================================
                //  ⬆️  FIM DA ADIÇÃO  ⬆️
                // ===================================================================
            ]
        },
        { "type": 14, "divider": true, "spacing": 2 },
        {
            "type": 10,
            "content": "### Transferência em Massa (Cross-Guild)"
        },
        {
            "type": 10,
            "content": "Selecione um servidor **DESTE PAINEL (DEV)** para transferir **TODOS** os membros verificados para lá."
        },
        {
            "type": 1, // Action Row
            "components": [
                {
                    "type": 3, // Select Menu
                    // ID CORRIGIDO (NÃO DUPLICADO)
                    "custom_id": "membros_mass_transfer_DEV",
                    "placeholder": "Selecione uma Guilda de DEV para enviar...",
                    "options": devGuildOptions
                }
            ]
        },
        { "type": 14, "divider": true, "spacing": 1 },
        {
            "type": 10,
            "content": "Selecione um servidor **COMUM (TODOS)** para transferir **TODOS** os membros verificados para lá."
        },
        {
            "type": 1, // Action Row
            "components": [
                {
                    "type": 3, // Select Menu
                    // ID CORRIGIDO (NÃO DUPLICADO)
                    "custom_id": "membros_mass_transfer_ALL",
                    "placeholder": "Selecione uma Guilda COMUM para enviar...",
                    "options": allGuildOptions
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