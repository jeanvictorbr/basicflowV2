// Crie este arquivo em: handlers/selects/select_hangman_start_channel.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const { getRandomWord } = require('../../utils/wordlist.js');

module.exports = {
    customId: 'select_hangman_start_channel',
    async execute(interaction) {
        const channelId = interaction.values[0];
        const channel = await interaction.guild.channels.fetch(channelId);

        const existingGame = await db.query('SELECT * FROM hangman_games WHERE channel_id = $1', [channelId]);
        if (existingGame.rows.length > 0) {
            return interaction.reply({ content: `❌ Já existe um Jogo da Forca em andamento no canal ${channel}.`, ephemeral: true });
        }

        const wordData = getRandomWord();
        const secretWord = wordData.word.toUpperCase();
        const theme = wordData.theme;
        const starterId = interaction.user.id;
        
        await db.query(
            `INSERT INTO hangman_games (channel_id, guild_id, user_id, secret_word, theme, status, participants, current_turn_user_id, turn_started_at) 
             VALUES ($1, $2, $3, $4, $5, 'loading', $6, $7, NOW())`,
            [channelId, interaction.guild.id, starterId, secretWord, theme, starterId, starterId]
        );

        const loadButton = new ButtonBuilder().setCustomId('hangman_load_dashboard').setLabel('Carregar Jogo da Forca').setStyle(ButtonStyle.Success).setEmoji('▶️');
        await channel.send({ content: 'Um novo Jogo da Forca está pronto para começar!', components: [new ActionRowBuilder().addComponents(loadButton)] });

        await interaction.update({ content: `✅ Jogo da Forca iniciado com sucesso em ${channel}!`, components: [] });
    }
};