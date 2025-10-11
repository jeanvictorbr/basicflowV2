// Substitua o conteúdo em: handlers/buttons/suggestion_consider.js
const updateSuggestionStatus = require('../../utils/updateSuggestionStatus.js');

module.exports = {
    customId: 'suggestion_consider',
    async execute(interaction) {
        await updateSuggestionStatus(interaction, 'considering', '#3498DB', '🤔 Em Análise');
    }
};