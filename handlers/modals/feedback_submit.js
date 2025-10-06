// handlers/modals/feedback_submit.js
const db = require('../../database.js');

module.exports = {
    customId: 'feedback_submit_', // Handler dinâmico
    async execute(interaction) {
        const [_, __, rating, channelId, guildId] = interaction.customId.split('_');
        const comment = interaction.fields.getTextInputValue('input_feedback_comment');

        try {
            // Busca quem foi o último a interagir/fechar o ticket
            const ticketData = (await db.query('SELECT claimed_by FROM tickets WHERE channel_id = $1', [channelId])).rows[0];
            const attendantId = ticketData ? ticketData.claimed_by : null;

            await db.query(
                `INSERT INTO ticket_feedback (guild_id, ticket_channel_id, user_id, claimed_by, rating, comment) VALUES ($1, $2, $3, $4, $5, $6)`,
                [guildId, channelId, interaction.user.id, attendantId, parseInt(rating, 10), comment]
            );

            await interaction.update({
                content: `Obrigado pelo seu feedback de **${rating} estrela(s)**! Sua avaliação foi registrada com sucesso.`,
                embeds: [],
                components: []
            });
        } catch (error) {
            if (error.code === '23505') { // unique_violation
                 await interaction.update({ content: 'Você já avaliou este atendimento. Obrigado!', embeds: [], components: [] });
            } else {
                console.error('[Feedback] Erro ao salvar avaliação:', error);
                await interaction.reply({ content: 'Ocorreu um erro ao registrar sua avaliação.', ephemeral: true });
            }
        }
    }
};