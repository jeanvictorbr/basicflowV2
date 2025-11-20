const { EmbedBuilder } = require('discord.js'); // Adicionado
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
    
    // Tratamento da URL
    let authUrl = (process.env.AUTH_SYSTEM_URL || '').trim();
    if (authUrl.endsWith('/')) authUrl = authUrl.slice(0, -1);
    authUrl = authUrl.replace('/auth/callback', ''); 

    if (!authUrl) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription("❌ **Erro:** `AUTH_SYSTEM_URL` não configurada no .env.");
        return interaction.editReply({ content: null, embeds: [embed], components: [] });
    }
    
    try {
        const response = await axios.get(`${authUrl}/api/users`, {
            params: { page, limit: 5, ...(isGlobal ? { all: 'true' } : { guild_id: guildId }) },
            timeout: 5000 
        });

        const { users, total, totalPages } = response.data;

        const components = [];
        const title = isGlobal ? "🌍 Painel Global (Developer)" : "👥 Gerenciamento Local";

        // --- CONSTRUÇÃO DO EMBED PRINCIPAL ---
        let descriptionText = `> **Total:** ${total} membros\n\n`;

        // Lista de Usuários
        if (!users || users.length === 0) {
            descriptionText += "🔒 **Nenhum usuário encontrado.**";
        } else {
            for (const user of users) {
                let originInfo = user.origin_guild === guildId ? '✅ Local' : (isGlobal ? `🆔 ${user.origin_guild?.slice(0,15)}...` : '⚠️ Outro');
                
                // Adiciona linha no texto do Embed em vez de componente separado para evitar poluição
                descriptionText += `**👤 ${user.username}**\nID: \`${user.id}\` • ${originInfo}\n`;
                
                // Adiciona botão de ação individual
                components.push({
                    "type": 1,
                    "components": [{ 
                        "type": 2, 
                        "style": 1, 
                        "label": `Puxar ${user.username.slice(0, 10)}`, 
                        "emoji": { "name": "🚀" }, 
                        "custom_id": `oauth_ask_${user.id}` 
                    }]
                });
            }
        }

        const mainEmbed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(descriptionText)
            .setColor(isGlobal ? 0x5865F2 : 0x57F287) // Azul ou Verde
            .setFooter({ text: `Página ${page} de ${totalPages || 1}` });

        // --- BOTÕES DE AÇÃO (LINHA DE CONTROLE) ---
        const actionRow = { "type": 1, "components": [] };

        // Botão de Massa
        actionRow.components.push({ 
            "type": 2, "style": 3, // Verde
            "label": isGlobal ? "Massa (Global)" : "Massa (Local)", 
            "emoji": { "name": "📦" }, 
            "custom_id": isGlobal ? "aut_oauth_mass_transfer_global_start" : "aut_oauth_mass_transfer_start" 
        });

        // Botão de Troca de Modo
        if (interaction.user.id === DEVELOPER_ID || interaction.user.id === interaction.guild.ownerId) {
            if (!isGlobal) {
                actionRow.components.push({ "type": 2, "style": 4, "label": "Global", "emoji": { "name": "🌎" }, "custom_id": "aut_oauth_global_view" });
            } else {
                actionRow.components.push({ "type": 2, "style": 2, "label": "Voltar Local", "emoji": { "name": "🏠" }, "custom_id": "aut_oauth_manage_members" });
            }
        }
        
        // Adiciona a linha de ação no topo dos componentes
        components.unshift(actionRow);

        // Paginação
        const modePrefix = isGlobal ? 'oauth_global_page_' : 'oauth_page_';
        components.push({
            "type": 1,
            "components": [
                { "type": 2, "style": 2, "label": "◀", "custom_id": `${modePrefix}${page - 1}`, "disabled": page <= 1 },
                { "type": 2, "style": 2, "label": "▶", "custom_id": `${modePrefix}${page + 1}`, "disabled": page >= totalPages },
                { "type": 2, "style": 4, "label": "Voltar", "emoji": { "name": "⬅️" }, "custom_id": "aut_reg_open_oauth_hub" }
            ]
        });

        // ENVIA A RESPOSTA (USANDO EMBEDS E SEM CONTENT)
        await interaction.editReply({ 
            content: null, // Importante: nulo para não dar erro de legado
            embeds: [mainEmbed], 
            components: components,
            files: [] 
        });

    } catch (error) {
        console.error("[OAuth Error]", error.message);
        
        let errorDesc = "Erro de conexão com a API de Autenticação.";
        if (error.response && error.response.status === 404) {
            errorDesc = "**Erro 404:** O Site de Auth está online mas a rota `/api/users` não foi encontrada.\n\n**Solução:** Reinicie o site `jvverify` na Discloud (Restart) para carregar o código novo.";
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
             errorDesc = "**Erro de Conexão:** O bot não conseguiu achar o site. Verifique se o link no `.env` está correto e o site online.";
        }

        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Falha na Conexão")
            .setDescription(errorDesc)
            .setColor('Red');

        // CORREÇÃO NO CATCH: Usa Embed e content: null
        await interaction.editReply({ 
            content: null, 
            embeds: [errorEmbed], 
            components: [], 
            files: [] 
        }).catch(e => console.error("Erro fatal (catch):", e.message));
    }
}

module.exports.loadMembersPage = loadMembersPage;