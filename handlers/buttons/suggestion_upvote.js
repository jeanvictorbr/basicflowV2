// Substitua o conteúdo em: handlers/buttons/suggestion_upvote.js
const db = require('../../database.js');
const updateSuggestionEmbed = require('../../utils/updateSuggestionEmbed.js');

module.exports = {
    customId: 'suggestion_upvote',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        try {
            // CORREÇÃO: Usa withClient para a transação
            await db.withClient(async (client) => {
                await client.query('BEGIN');

                const suggestionResult = await client.query('SELECT * FROM suggestions WHERE message_id = $1 FOR UPDATE', [interaction.message.id]);
                if (suggestionResult.rows.length === 0) throw new Error('Esta sugestão não foi encontrada no banco de dados.');
                
                const suggestion = suggestionResult.rows[0];
                const voteResult = await client.query('SELECT * FROM suggestion_votes WHERE suggestion_id = $1 AND user_id = $2', [suggestion.id, interaction.user.id]);
                const existingVote = voteResult.rows[0];

                if (existingVote) {
                    if (existingVote.vote_type === 'upvote') {
                        await client.query('DELETE FROM suggestion_votes WHERE id = $1', [existingVote.id]);
                        await client.query('UPDATE suggestions SET upvotes = upvotes - 1 WHERE id = $1', [suggestion.id]);
                        await interaction.editReply({ content: '✅ Seu upvote foi removido.' });
                    } else {
                        await client.query('UPDATE suggestion_votes SET vote_type = $1 WHERE id = $2', ['upvote', existingVote.id]);
                        await client.query('UPDATE suggestions SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = $1', [suggestion.id]);
                        await interaction.editReply({ content: '✅ Seu voto foi alterado para upvote!' });
                    }
                } else {
                    await client.query('INSERT INTO suggestion_votes (suggestion_id, user_id, vote_type) VALUES ($1, $2, $3)', [suggestion.id, interaction.user.id, 'upvote']);
                    await client.query('UPDATE suggestions SET upvotes = upvotes + 1 WHERE id = $1', [suggestion.id]);
                    await interaction.editReply({ content: '✅ Seu upvote foi registrado com sucesso!' });
                }

                await client.query('COMMIT');
            });

            await updateSuggestionEmbed(interaction.message);

        } catch (error) {
            console.error('[Suggestion Upvote] Erro:', error);
            await interaction.editReply({ content: `❌ ${error.message || 'Ocorreu um erro ao processar seu voto.'}` });
        }
    }
};