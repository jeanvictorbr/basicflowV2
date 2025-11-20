const { EmbedBuilder } = require('discord.js');
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
        return interaction.editReply({ 
            content: "❌ **Erro de Configuração:** URL do Site não definida no .env", 
            embeds: [], 
            components: [] 
        });
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
            descriptionText += "🔒 **Nenhum usuário encontrado.**\n*Seus membros precisam se verificar no site para aparecerem aqui.*";
        } else {
            for (const user of users) {
                let originInfo = user.origin_guild === guildId ? '✅ Local' : (isGlobal ? `🆔 ${user.origin_guild?.slice(0,15)}...` : '⚠️ Outro');
                
                // Adiciona user na descrição do Embed
                descriptionText += `**👤 ${user.username}**\nID: \`${user.id}\` • ${originInfo}\n`;
                
                // Adiciona botão de ação individual
                components.push({
                    "type": 1,
                    "components": [{ 
                        "type": 2, 
                        "style": 1, // Roxo (Blurple)
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
            .setColor(isGlobal ? 0x5865F2 : 0x57F287)
            .setFooter({ text: `Página ${page} de ${totalPages || 1} • Sistema CloudFlow` });

        // --- BOTÕES DE AÇÃO (LINHA DE CONTROLE) ---
        const actionRow = { "type": 1, "components": [] };

        // Botão de Massa
        actionRow.components.push({ 
            "type": 2, "style": 3, // Verde
            "label": isGlobal ? "Massa (Global)" : "Massa (Local)", 
            "emoji": { "name": "📦" }, 
            "custom_id": isGlobal ? "aut_oauth_mass_transfer_global_start" : "aut_oauth_mass_transfer_start" 
        });

        // Botão de Troca de Modo (Developer)
        if (interaction.user.id === DEVELOPER_ID || interaction.user.id === interaction.guild.ownerId) {
            if (!isGlobal) {
                actionRow.components.push({ "type": 2, "style": 4, "label": "Global View", "emoji": { "name": "🌎" }, "custom_id": "aut_oauth_global_view" });
            } else {
                actionRow.components.push({ "type": 2, "style": 2, "label": "Voltar Local", "emoji": { "name": "🏠" }, "custom_id": "aut_oauth_manage_members" });
            }
        }
        
        components.unshift(actionRow); // Adiciona no topo

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

        // ENVIA A RESPOSTA BLINDADA
        // Truque: content com espaço vazio " " limpa a mensagem antiga sem quebrar a API v2
        await interaction.editReply({ 
            content: " ", 
            embeds: [mainEmbed], 
            components: components,
            files: [] 
        });

    } catch (error) {
        console.error("[OAuth Error]", error.message);
        
        let errorDesc = "Erro desconhecido ao conectar com o Site.";
        if (error.response && error.response.status === 404) {
            errorDesc = "⚠️ **Erro 404:** O Site está online, mas a API não foi encontrada.\n\n**Solução:** Reinicie o site `jvverify` na Discloud (Restart) para carregar a nova atualização.";
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
             errorDesc = "❌ **Offline:** O bot não conseguiu conectar ao site.\nVerifique se o site está online na Discloud.";
        }

        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Erro de Conexão")
            .setDescription(errorDesc)
            .setColor('Red');

        // Resposta de erro segura
        await interaction.editReply({ 
            content: " ", 
            embeds: [errorEmbed], 
            components: [], 
            files: [] 
        }).catch(e => console.error("Erro fatal no catch:", e.message));
    }
}

module.exports.loadMembersPage = loadMembersPage;