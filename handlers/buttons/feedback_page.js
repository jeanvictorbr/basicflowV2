// Crie em: handlers/buttons/feedback_page.js
const { getFeedbackData } = require('./tickets_view_feedback.js');
const generateFeedbackMenu = require('../../ui/ticketsFeedbackMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'feedback_page_', // Handler dinâmico
    async execute(interaction) {
        await interaction.deferUpdate();
        const page = parseInt(interaction.customId.split('_')[2], 10);

        if (isNaN(page)) return;

        const feedbackData = await getFeedbackData(interaction.guild.id, page);

        await interaction.editReply({
            components: generateFeedbackMenu(feedbackData),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};