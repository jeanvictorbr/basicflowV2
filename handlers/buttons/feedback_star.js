// Crie em: handlers/buttons/feedback_star.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'feedback_star_', // Handler dinâmico
    async execute(interaction) {
        // Verifica se este ticket já foi avaliado para evitar duplicatas
        const existingFeedback = (await db.query('SELECT 1 FROM ticket_feedback WHERE ticket_channel_id = $1', [interaction.customId.split('_')[3]])).rows;
        if (existingFeedback.length > 0) {
            return interaction.update({ content: 'Você já avaliou este atendimento. Obrigado!', embeds: [], components: [] });
        }

        const modal = new ModalBuilder()
            .setCustomId(interaction.customId.replace('star', 'submit')) // Reutiliza os dados no customId
            .setTitle('Deixe um Comentário (Opcional)');

        const commentInput = new TextInputBuilder()
            .setCustomId('input_feedback_comment')
            .setLabel("Seu comentário")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Fique à vontade para deixar elogios, críticas ou sugestões.")
            .setRequired(false);
        
        modal.addComponents(new ActionRowBuilder().addComponents(commentInput));
        await interaction.showModal(modal);
    }
};