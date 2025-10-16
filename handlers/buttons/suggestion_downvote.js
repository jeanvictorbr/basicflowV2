// Substitua o conteúdo em: handlers/buttons/suggestion_downvote.js
const db = require('../../database.js');
const updateSuggestionEmbed = require('../../utils/updateSuggestionEmbed.js');

module.exports = {
    customId: 'suggestion_downvote',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            await db.withClient(async (client) => {
                await client.query('BEGIN');

                const suggestionResult = await client.query('SELECT * FROM suggestions WHERE message_id = $1 FOR UPDATE', [interaction.message.id]);
                if (suggestionResult.rows.length === 0) {
                    throw new Error('Esta sugestão não foi encontrada no banco de dados.');
                }
                const suggestion = suggestionResult.rows[0];

                const voteResult = await client.query('SELECT * FROM suggestion_votes WHERE suggestion_id = $1 AND user_id = $2', [suggestion.id, interaction.user.id]);
                const existingVote = voteResult.rows[0];

                if (existingVote) {
                    if (existingVote.vote_type === 'downvote') {
                        await client.query('DELETE FROM suggestion_votes WHERE id = $1', [existingVote.id]);
                        await client.query('UPDATE suggestions SET downvotes = downvotes - 1 WHERE id = $1', [suggestion.id]);
                        await interaction.editReply({ content: '✅ Seu downvote foi removido.' });
                    } else {
                        await client.query('UPDATE suggestion_votes SET vote_type = $1 WHERE id = $2', ['downvote', existingVote.id]);
                        await client.query('UPDATE suggestions SET downvotes = downvotes + 1, upvotes = upvotes - 1 WHERE id = $1', [suggestion.id]);
                        await interaction.editReply({ content: '✅ Seu voto foi alterado para downvote!' });
                    }
                } else {
                    await client.query('INSERT INTO suggestion_votes (suggestion_id, user_id, vote_type) VALUES ($1, $2, $3)', [suggestion.id, interaction.user.id, 'downvote']);
                    await client.query('UPDATE suggestions SET downvotes = downvotes + 1 WHERE id = $1', [suggestion.id]);
                    await interaction.editReply({ content: '✅ Seu downvote foi registrado com sucesso!' });
                }

                await client.query('COMMIT');
            });
            
            await updateSuggestionEmbed(interaction.message);

        } catch (error) {
            console.error('[Suggestion Downvote] Erro:', error);
            await interaction.editReply({ content: `❌ ${error.message || 'Ocorreu um erro ao processar seu voto.'}` }).catch(()=>{});
        }
    }
};