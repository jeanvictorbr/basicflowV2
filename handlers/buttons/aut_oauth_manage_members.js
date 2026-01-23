const axios = require('axios');

// SEU ID DE DEVELOPER (Substitua pelo seu real se precisar)
const DEVELOPER_ID = process.env.OWNER_ID || '140867979578576916';

module.exports = {
    customId: 'aut_oauth_manage_members',
    async execute(interaction) {
        await loadMembersPage(interaction, 1, false);
    }
};

async function loadMembersPage(interaction, page, isGlobal = false) {
    // Tenta deferir apenas se ainda não foi feito
    try {
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();
    } catch(e) {}

    const guildId = interaction.guild.id;
    // Tratamento básico da URL
    let authUrl = process.env.AUTH_SYSTEM_URL ? process.env.AUTH_SYSTEM_URL.trim().replace(/\/$/, '').replace('/auth/callback', '') : '';

    if (!authUrl) {
        // Se não tiver URL configurada, avisa sem crashar
        return interaction.followUp({ content: '❌ URL do sistema (AUTH_SYSTEM_URL) não configurada no .env', ephemeral: true });
    }
    
    try {
        const response = await axios.get(`${authUrl}/api/users`, {
            params: { page, limit: 5, ...(isGlobal ? { all: 'true' } : { guild_id: guildId }) }
        });
        const { users, total, totalPages } = response.data;

        const components = [];
        const title = isGlobal ? "🌍 Painel Global (Developer)" : "👥 Gerenciamento Local";

        // Componentes V2 (Headers e Textos)
        components.push({ "type": 10, "content": `## ${title}` });
        components.push({ "type": 10, "content": `> **Total:** ${total} membros` });
        components.push({ "type": 14, "divider": true, "spacing": 2 });

        // --- BOTÕES DE AÇÃO ---
        const actionButtons = [];

        // Botão de Massa (Varia o ID se for Global ou Local)
        actionButtons.push({ 
            "type": 2, "style": 3, // Verde
            "label": isGlobal ? "Transferir Global (Massa)" : "Transferir Local (Massa)", 
            "emoji": { "name": "📦" }, 
            "custom_id": isGlobal ? "aut_oauth_mass_transfer_global_start" : "aut_oauth_mass_transfer_start" 
        });

        // --- [COMENTADO] BOTÃO DE TROCA DE MODO (PAINEL GLOBAL) ---
        /*
        // Botão de Troca de Modo (Aparece só para você/Dono)
        if (interaction.user.id === DEVELOPER_ID || interaction.user.id === interaction.guild.ownerId) {
            if (!isGlobal) {
                actionButtons.push({ "type": 2, "style": 4, "label": "Ver Lista Global", "emoji": { "name": "🌎" }, "custom_id": "aut_oauth_global_view" });
            } else {
                actionButtons.push({ "type": 2, "style": 2, "label": "Voltar para Local", "emoji": { "name": "🏠" }, "custom_id": "aut_oauth_manage_members" });
            }
        }
        */
        // ----------------------------------------------------------

        components.push({ "type": 1, "components": actionButtons });
        components.push({ "type": 14, "divider": true, "spacing": 1 });

        // Lista de Usuários
        if (!users || users.length === 0) {
            components.push({ "type": 10, "content": "🔒 **Nenhum usuário encontrado.**" });
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

        // Envio seguro: content: null evita conflito com componentes V2
        await interaction.editReply({ components: components, embeds: [], content: null });

    } catch (error) {
        console.error('[OAuth Handler] Erro de API:', error.message);
        
        // CORREÇÃO CRÍTICA DO CRASH:
        // Se der erro na API (500), não tente editar a estrutura complexa com string simples usando editReply.
        // Use followUp ephemeral para alertar o usuário sem quebrar o form body.
        if (interaction.deferred || interaction.replied) {
            await interaction.followUp({ 
                content: "❌ **Erro de Conexão:** A API de verificação retornou um erro (possivelmente SSL/Server Error). Tente novamente mais tarde.", 
                ephemeral: true 
            }).catch(() => {});
        } else {
            await interaction.reply({ content: "❌ Erro ao conectar na API.", ephemeral: true }).catch(() => {});
        }
    }
}

module.exports.loadMembersPage = loadMembersPage;