// Substitua o conteúdo em: handlers/buttons/suggestion_deny.js
const updateSuggestionStatus = require('../../utils/updateSuggestionStatus.js');

module.exports = {
    customId: 'suggestion_deny',
    async execute(interaction) {
        await updateSuggestionStatus(interaction, 'denied', '#E74C3C', '❌ Negada');
    }
};