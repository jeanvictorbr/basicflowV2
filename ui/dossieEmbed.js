// ui/dossieEmbed.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../database');
const hasFeature = require('../utils/featureCheck'); // Importa a verificação de feature

const ITEMS_PER_PAGE = 5;

// A função continua assíncrona para poder verificar a feature
module.exports = async function generateDossieEmbed(interaction, targetUser, page = 0) {
    const logsResult = await db.query('SELECT * FROM moderation_logs WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC', [interaction.guild.id, targetUser.id]);
    const logs = logsResult.rows;
    const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
    const paginatedLogs = logs.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    const notesResult = await db.query('SELECT * FROM moderation_notes WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC', [interaction.guild.id, targetUser.id]);
    const notes = notesResult.rows;

    const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setAuthor({ name: `Dossiê de Moderação: ${targetUser.tag}`, iconURL: targetUser.displayAvatarURL() })
        .addFields(
            { name: '📋 Histórico de Punições', value: paginatedLogs.length > 0 ? paginatedLogs.map(log => `**ID:${log.case_id}** | **Ação:** ${log.action}\n**Motivo:** ${log.reason}\n*Por <@${log.moderator_id}> em <t:${Math.floor(new Date(log.created_at).getTime() / 1000)}:f>*`).join('\n\n') : 'Nenhuma punição registrada.' },
            { name: '📝 Notas Internas da Staff', value: notes.length > 0 ? notes.map(note => `**ID:${note.note_id}** | *Por <@${note.moderator_id}>*\n> ${note.content}`).join('\n') : 'Nenhuma nota registrada.' }
        )
        .setFooter({ text: `ID do Usuário: ${targetUser.id} | Página ${page + 1} de ${totalPages || 1}` });

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`mod_dossie_history_page_${targetUser.id}_${page - 1}`).setLabel('Anterior').setStyle(ButtonStyle.Primary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId(`mod_dossie_history_page_${targetUser.id}_${page + 1}`).setLabel('Próxima').setStyle(ButtonStyle.Primary).setDisabled(page + 1 >= totalPages),
        new ButtonBuilder().setCustomId(`mod_adicionar_nota_${targetUser.id}`).setLabel('Adicionar Nota').setStyle(ButtonStyle.Secondary).setEmoji('📝')
    );
    
    // --- LÓGICA CORRIGIDA DO BOTÃO ---
    // 1. Verifica se o servidor tem a feature de análise por IA.
    const hasAIAccess = await hasFeature(interaction.guild.id, 'DOSSIE_AI_ANALYSIS');

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`mod_dossie_manage_${targetUser.id}`).setLabel('Gerenciar Histórico').setStyle(ButtonStyle.Danger).setEmoji('🛠️'),
        
        // 2. O botão agora é criado sempre, mas o 'setDisabled' depende do acesso à feature.
        new ButtonBuilder()
            .setCustomId(`mod_dossie_analyze_${targetUser.id}`)
            .setLabel('Analisar Padrão (IA)')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🧠')
            .setDisabled(!hasAIAccess) // Desabilitado se hasAIAccess for false
    );

    return { embeds: [embed], components: [row1, row2] };
};