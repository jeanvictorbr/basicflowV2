// Crie este arquivo em: handlers/modals/modal_stop_submit.js
const db = require('../../database.js');
const generateStopDashboard = require('../../ui/stopGameDashboard.js');

module.exports = {
    customId: 'modal_stop_submit_',
    async execute(interaction) {
        await interaction.deferUpdate();

        const category = interaction.customId.split('_')[3];
        const word = interaction.fields.getTextInputValue('input_word');

        const game = (await db.query('SELECT * FROM stop_games WHERE message_id = $1', [interaction.message.id])).rows[0];
        if (!game) return;

        if (word.trim().toUpperCase().charAt(0) !== game.letter) {
            await interaction.followUp({ content: `❌ Palavra inválida! Sua resposta para "${category}" deve começar com a letra **${game.letter}**.`, ephemeral: true });
            return;
        }

        await db.query(
            `INSERT INTO stop_submissions (game_message_id, user_id, category, word)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (game_message_id, user_id, category)
             DO UPDATE SET word = $4`,
            [interaction.message.id, interaction.user.id, category, word]
        );

        const submissions = (await db.query('SELECT * FROM stop_submissions WHERE game_message_id = $1', [interaction.message.id])).rows;
        
        await interaction.editReply(generateStopDashboard(game, submissions));
    }
};