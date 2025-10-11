// Substitua o conteúdo em: handlers/buttons/suggestion_approve.js
const updateSuggestionStatus = require('../../utils/updateSuggestionStatus.js');

module.exports = {
    customId: 'suggestion_approve',
    async execute(interaction) {
        await updateSuggestionStatus(interaction, 'approved', '#2ECC71', '✅ Aprovada');
    }
};