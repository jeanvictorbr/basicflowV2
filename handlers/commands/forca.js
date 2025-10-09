// Substitua o conteúdo em: handlers/commands/forca.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const { getRandomWord } = require('../../utils/wordlist.js');

module.exports = {
    customId: 'forca',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const existingGame = await db.query('SELECT * FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        if (existingGame.rows.length > 0) {
            return interaction.editReply({ content: '❌ Já existe um jogo da Forca em andamento neste canal.' });
        }

        const secretWord = getRandomWord();
        const starterId = interaction.user.id;
        const initialLog = `> 💬 <@${starterId}> iniciou um novo jogo!`;

        try {
            await db.query(
                `INSERT INTO hangman_games (channel_id, guild_id, user_id, secret_word, action_log, status, participants, current_turn_user_id, turn_started_at) 
                 VALUES ($1, $2, $3, $4, $5, 'loading', $6, $7, NOW())`,
                [interaction.channel.id, interaction.guild.id, starterId, secretWord, initialLog, starterId, starterId]
            );

            const loadButton = new ButtonBuilder()
                .setCustomId('hangman_load_dashboard')
                .setLabel('Carregar Jogo da Forca')
                .setStyle(ButtonStyle.Success)
                .setEmoji('▶️');

            await interaction.channel.send({
                content: 'Um novo Jogo da Forca está pronto para começar!',
                components: [new ActionRowBuilder().addComponents(loadButton)]
            });

            await interaction.editReply({ content: '✅ O botão para iniciar o Jogo da Forca foi enviado ao canal!' });

        } catch (error) {
            console.error('[FORCA] Erro ao criar o botão de início:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao tentar iniciar o jogo.' });
        }
    }
};