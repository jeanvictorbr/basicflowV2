// Crie em: handlers/modals/feedback_submit.js
const db = require('../../database.js');

module.exports = {
    customId: 'feedback_submit_', // Handler dinâmico
    async execute(interaction) {
        const [_, __, rating, channelId] = interaction.customId.split('_');
        const comment = interaction.fields.getTextInputValue('input_feedback_comment');

        try {
            await db.query(
                `INSERT INTO ticket_feedback (guild_id, ticket_channel_id, user_id, rating, comment) VALUES ($1, $2, $3, $4, $5)`,
                [interaction.guild.id, channelId, interaction.user.id, parseInt(rating, 10), comment]
            );

            await interaction.update({
                content: `Obrigado pelo seu feedback de **${rating} estrela(s)**! Sua avaliação foi registrada com sucesso.`,
                embeds: [],
                components: []
            });
        } catch (error) {
            // Trata o caso de o usuário tentar avaliar duas vezes rapidamente
            if (error.code === '23505') { // unique_violation
                 await interaction.update({ content: 'Você já avaliou este atendimento. Obrigado!', embeds: [], components: [] });
            } else {
                console.error('[Feedback] Erro ao salvar avaliação:', error);
                await interaction.reply({ content: 'Ocorreu um erro ao registrar sua avaliação.', ephemeral: true });
            }
        }
    }
};