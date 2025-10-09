// Crie este arquivo em: handlers/buttons/hangman_guess_word.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'hangman_guess_word',
    async execute(interaction) {
        const game = (await db.query('SELECT * FROM hangman_games WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        if (!game || !game.participants.split(',').includes(interaction.user.id)) {
            return interaction.reply({ content: '❌ Você precisa estar participando do jogo para adivinhar a palavra.', ephemeral: true });
        }
        if (interaction.user.id !== game.current_turn_user_id) {
            return interaction.reply({ content: `❌ Não é a sua vez! Aguarde o turno de <@${game.current_turn_user_id}>.`, ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId('modal_hangman_guess_word')
            .setTitle('Adivinhar a Palavra Secreta');
            
        const wordInput = new TextInputBuilder()
            .setCustomId('input_word_guess')
            .setLabel("Qual é a sua tentativa?")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Digite a palavra completa aqui...')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(wordInput));
        await interaction.showModal(modal);
    }
};