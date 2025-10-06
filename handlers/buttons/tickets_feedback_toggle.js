// handlers/buttons/tickets_feedback_toggle.js
const db = require('../../database.js');
const generateFeedbackMenu = require('../../ui/ticketsFeedbackMenu.js');
const { getFeedbackData } = require('./tickets_view_feedback.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'tickets_feedback_toggle',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        await db.query(`UPDATE guild_settings SET tickets_feedback_enabled = NOT COALESCE(tickets_feedback_enabled, false) WHERE guild_id = $1`, [interaction.guild.id]);
        
        // Busca os dados novamente para renderizar o painel atualizado
        const page = parseInt(interaction.message.components[2]?.components[0].customId.split('_')[2], 10) || 0;
        const feedbackData = await getFeedbackData(interaction.guild.id, page);

        await interaction.editReply({
            components: generateFeedbackMenu(feedbackData),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};