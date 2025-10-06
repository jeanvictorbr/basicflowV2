// handlers/buttons/tickets_view_feedback.js
const db = require('../../database.js');
const generateFeedbackMenu = require('../../ui/ticketsFeedbackMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

const ITEMS_PER_PAGE = 3;

async function getFeedbackData(guildId, page = 0) {
    const offset = page * ITEMS_PER_PAGE;

    const settingsRes = await db.query('SELECT tickets_feedback_enabled FROM guild_settings WHERE guild_id = $1', [guildId]);
    const statsRes = await db.query('SELECT COUNT(*) as total, AVG(rating) as average FROM ticket_feedback WHERE guild_id = $1', [guildId]);
    const feedbackRes = await db.query('SELECT * FROM ticket_feedback WHERE guild_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [guildId, ITEMS_PER_PAGE, offset]);

    const totalRatings = parseInt(statsRes.rows[0].total, 10) || 0;
    const avgRating = parseFloat(statsRes.rows[0].average) || 0;

    return {
        settings: settingsRes.rows[0] || { tickets_feedback_enabled: false },
        avgRating,
        totalRatings,
        feedbacks: feedbackRes.rows,
        page,
        totalPages: Math.ceil(totalRatings / ITEMS_PER_PAGE),
    };
}


module.exports = {
    customId: 'tickets_view_feedback',
    async execute(interaction) {
        await interaction.deferUpdate();

        const feedbackData = await getFeedbackData(interaction.guild.id, 0);

        await interaction.editReply({
            components: generateFeedbackMenu(feedbackData),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    },
    getFeedbackData
};