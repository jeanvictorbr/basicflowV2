// Substitua o conteúdo em: utils/updateSuggestionEmbed.js
const { EmbedBuilder, ActionRowBuilder } = require('discord.js');
const db = require('../database.js');

module.exports = async function updateSuggestionEmbed(message) {
    const suggestion = (await db.query('SELECT * FROM suggestions WHERE message_id = $1', [message.id])).rows[0];
    if (!suggestion) return;

    const upvotes = suggestion.upvotes;
    const downvotes = suggestion.downvotes;
    const totalVotes = upvotes + downvotes;

    let progressBar = '`Sem votos`';
    if (totalVotes > 0) {
        const upvotePercentage = (upvotes / totalVotes) * 100;
        const upvoteBlocks = Math.round(upvotePercentage / 10);
        const downvoteBlocks = 10 - upvoteBlocks;
        progressBar = '🟩'.repeat(upvoteBlocks) + '🟥'.repeat(downvoteBlocks);
    }

    const originalEmbed = message.embeds[0];
    const updatedEmbed = EmbedBuilder.from(originalEmbed);
    
    const fieldIndex = updatedEmbed.data.fields.findIndex(f => f.name === 'Votação');
    if (fieldIndex !== -1) {
        updatedEmbed.spliceFields(fieldIndex, 1, {
            name: 'Votação',
            value: `👍 \`${upvotes}\`   |   👎 \`${downvotes}\`\n${progressBar}`
        });
    }

    // --- CORREÇÃO DEFINITIVA APLICADA AQUI ---
    // Clona todas as fileiras de botões existentes para garantir que nenhuma seja perdida.
    const updatedComponents = message.components.map(row => ActionRowBuilder.from(row));

    // Garante que a primeira fileira (votos) exista antes de tentar modificá-la.
    if (updatedComponents.length > 0 && updatedComponents[0].components.length >= 2) {
        // Atualiza o contador de upvotes e downvotes nos botões
        updatedComponents[0].components[0].setLabel(String(upvotes));
        updatedComponents[0].components[1].setLabel(String(downvotes));
    }
    // --- FIM DA CORREÇÃO ---

    await message.edit({ embeds: [updatedEmbed], components: updatedComponents });
};