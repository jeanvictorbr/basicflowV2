// Substitua o conteúdo em: utils/updateSuggestionStatus.js
const { EmbedBuilder, ActionRowBuilder } = require('discord.js');
const db = require('../database.js');

module.exports = async function updateSuggestionStatus(interaction, newStatus, color, statusText) {
    const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
    if (!interaction.member.roles.cache.has(settings.suggestions_staff_role)) {
        return interaction.reply({ content: '❌ Você não tem permissão para gerenciar sugestões.', ephemeral: true });
    }

    await interaction.deferUpdate();

    await db.query('UPDATE suggestions SET status = $1 WHERE message_id = $2', [newStatus, interaction.message.id]);

    const originalEmbed = interaction.message.embeds[0];
    const updatedEmbed = EmbedBuilder.from(originalEmbed).setColor(color);

    const statusFieldIndex = updatedEmbed.data.fields.findIndex(field => field.name === 'Status');
    if (statusFieldIndex !== -1) {
        updatedEmbed.spliceFields(statusFieldIndex, 1, { name: 'Status', value: `${statusText} por ${interaction.user}`, inline: true });
    }

    let finalComponents = [];
    if (newStatus === 'approved' || newStatus === 'denied') {
        finalComponents = []; 
        const suggestion = (await db.query('SELECT thread_id FROM suggestions WHERE message_id = $1', [interaction.message.id])).rows[0];
        if (suggestion && suggestion.thread_id) {
            const thread = await interaction.guild.channels.fetch(suggestion.thread_id).catch(() => null);
            if (thread) {
                await thread.delete('Sugestão finalizada.').catch(err => console.error('Falha ao apagar a thread:', err));
            }
        }
    } else if (newStatus === 'considering') {
        // --- LÓGICA CORRIGIDA E DEFINITIVA ---
        // Clona todas as fileiras de botões existentes para garantir que nada se perca.
        finalComponents = interaction.message.components.map(row => ActionRowBuilder.from(row));

        // Encontra a fileira de botões da staff (geralmente a segunda, índice 1)
        const staffButtonsRow = finalComponents[1];
        if (staffButtonsRow) {
            // Encontra e desabilita apenas o botão 'Em Análise'
            staffButtonsRow.components.forEach(button => {
                if (button.data.custom_id === 'suggestion_consider') {
                    button.setDisabled(true);
                }
            });
        }
        // --- FIM DA CORREÇÃO ---
    }
    
    await interaction.message.edit({ embeds: [updatedEmbed], components: finalComponents });
    
    const logChannel = await interaction.guild.channels.fetch(settings.suggestions_log_channel).catch(() => null);
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setColor(color)
            .setTitle(`Sugestão ${statusText.replace(/<a?:.+?:\d+>|[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim()}`)
            .setDescription(`**Sugestão:** "${originalEmbed.title}"\n**Autor:** ${originalEmbed.author.name}\n**Ação por:** ${interaction.user}`)
            .setURL(interaction.message.url)
            .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
    }
}