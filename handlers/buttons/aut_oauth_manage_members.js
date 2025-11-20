const axios = require('axios');

// SEU ID DE DEVELOPER
const DEVELOPER_ID = process.env.OWNER_ID || '140867979578576916';

module.exports = {
    customId: 'aut_oauth_manage_members',
    async execute(interaction) {
        await loadMembersPage(interaction, 1, false);
    }
};

async function loadMembersPage(interaction, page, isGlobal = false) {
    // Garante o defer apenas se ainda não foi feito
    if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate().catch(() => {});

    const guildId = interaction.guild.id;
    
    // Tratamento da URL para evitar barras duplas
    let authUrl = (process.env.AUTH_SYSTEM_URL || '').trim();
    if (authUrl.endsWith('/')) authUrl = authUrl.slice(0, -1);
    authUrl = authUrl.replace('/auth/callback', ''); 

    // Se a URL estiver vazia, avisa logo
    if (!authUrl) {
        return interaction.editReply({ 
            content: "❌ **Erro:** `AUTH_SYSTEM_URL` não configurada no .env.", 
            components: [], embeds: [] 
        });
    }
    
    try {
        const response = await axios.get(`${authUrl}/api/users`, {
            params: { page, limit: 5, ...(isGlobal ? { all: 'true' } : { guild_id: guildId }) },
            timeout: 5000 // Timeout de 5s para não travar o bot
        });

        const { users, total, totalPages } = response.data;

        const components = [];
        const title = isGlobal ? "🌍 Painel Global (Developer)" : "👥 Gerenciamento Local";

        // Cabeçalho como texto (Markdown)
        // Nota: Discord não aceita titulo em content puro, usamos formatação
        let contentMessage = `## ${title}\n> **Total:** ${total} membros`;

        components.push({ "type": 14, "divider": true, "spacing": 2 });

        // --- BOTÕES DE AÇÃO ---
        const actionButtons = [];

        // Botão de Massa
        actionButtons.push({ 
            "type": 2, "style": 3, // Verde
            "label": isGlobal ? "Transferir Global (Massa)" : "Transferir Local (Massa)", 
            "emoji": { "name": "📦" }, 
            "custom_id": isGlobal ? "aut_oauth_mass_transfer_global_start" : "aut_oauth_mass_transfer_start" 
        });

        // Botão de Troca de Modo
        if (interaction.user.id === DEVELOPER_ID || interaction.user.id === interaction.guild.ownerId) {
            if (!isGlobal) {
                actionButtons.push({ "type": 2, "style": 4, "label": "Ver Lista Global", "emoji": { "name": "🌎" }, "custom_id": "aut_oauth_global_view" });
            } else {
                actionButtons.push({ "type": 2, "style": 2, "label": "Voltar para Local", "emoji": { "name": "🏠" }, "custom_id": "aut_oauth_manage_members" });
            }
        }
        components.push({ "type": 1, "components": actionButtons });
        components.push({ "type": 14, "divider": true, "spacing": 1 });

        // Lista de Usuários
        if (!users || users.length === 0) {
            contentMessage += "\n\n🔒 **Nenhum usuário encontrado.**";
        } else {
            for (const user of users) {
                let originInfo = user.origin_guild === guildId ? '✅ Local' : (isGlobal ? `🆔 ${user.origin_guild?.slice(0,15)}...` : '⚠️ Outro');
                components.push({
                    "type": 9, 
                    "accessory": { "type": 2, "style": 1, "label": "Puxar", "emoji": { "name": "🚀" }, "custom_id": `oauth_ask_${user.id}` },
                    "components": [{ "type": 10, "content": `### 👤 ${user.username}` }, { "type": 10, "content": `> **ID:** ${user.id} • ${originInfo}` }]
                });
                components.push({ "type": 14, "divider": true, "spacing": 1 });
            }
        }

        // Paginação
        const modePrefix = isGlobal ? 'oauth_global_page_' : 'oauth_page_';
        components.push({
            "type": 1,
            "components": [
                { "type": 2, "style": 2, "label": "◀", "custom_id": `${modePrefix}${page - 1}`, "disabled": page <= 1 },
                { "type": 2, "style": 2, "label": `${page}/${totalPages || 1}`, "custom_id": "noop", "disabled": true },
                { "type": 2, "style": 2, "label": "▶", "custom_id": `${modePrefix}${page + 1}`, "disabled": page >= totalPages },
                { "type": 2, "style": 4, "label": "Voltar", "emoji": { "name": "⬅️" }, "custom_id": "aut_reg_open_oauth_hub" }
            ]
        });

        // CORREÇÃO CRÍTICA: 
        // 1. content deve ter texto válido (não vazio), ou ser null.
        // 2. embeds deve ser [] para limpar embeds antigos.
        await interaction.editReply({ 
            content: contentMessage, 
            components: components, 
            embeds: [],
            files: [] 
        });

    } catch (error) {
        console.error("[OAuth Error]", error.message);
        
        let errorMsg = "❌ Erro de conexão com API.";
        if (error.response && error.response.status === 404) {
            errorMsg = "❌ **Erro 404:** O Site de Auth não foi encontrado ou a rota `/api/users` não existe. Verifique se o site está online na Discloud.";
        }

        // CORREÇÃO NO CATCH:
        // Garante que limpamos tudo ao mostrar o erro para evitar 'Invalid Form Body'
        await interaction.editReply({ 
            content: errorMsg, 
            components: [], 
            embeds: [], 
            files: [] 
        }).catch(e => console.error("Erro fatal ao enviar mensagem de erro:", e.message));
    }
}

module.exports.loadMembersPage = loadMembersPage;