// Substitua o conteúdo em: handlers/commands/forca.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const { getRandomWord } = require('../../utils/wordlist.js');

module.exports = {
    customId: 'forca',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        // 1. Verifica se já existe um jogo no canal
        const existingGame = await db.query('SELECT * FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        if (existingGame.rows.length > 0) {
            return interaction.editReply({ content: '❌ Já existe um jogo da Forca em andamento neste canal. Termine o atual antes de começar um novo.' });
        }

        // 2. Prepara os dados do novo jogo
        const secretWord = getRandomWord();
        const initialLog = `> 💬 <@${interaction.user.id}> iniciou um novo jogo!`;
        const gameData = {
            channel_id: interaction.channel.id,
            guild_id: interaction.guild.id,
            user_id: interaction.user.id,
            secret_word: secretWord,
            action_log: initialLog,
        };

        try {
            // 3. Salva o jogo no banco de dados ANTES de enviar a mensagem
            await db.query(
                `INSERT INTO hangman_games (channel_id, guild_id, user_id, secret_word, action_log) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [gameData.channel_id, gameData.guild_id, gameData.user_id, gameData.secret_word, gameData.action_log]
            );

            // 4. Cria o botão de carregamento
            const loadButton = new ButtonBuilder()
                .setCustomId('hangman_load_dashboard')
                .setLabel('Carregar Jogo da Forca')
                .setStyle(ButtonStyle.Success)
                .setEmoji('▶️');

            // 5. Envia a mensagem simples com o botão
            await interaction.channel.send({
                content: 'Um novo Jogo da Forca está pronto para começar!',
                components: [new ActionRowBuilder().addComponents(loadButton)]
            });

            // 6. Confirma para o usuário que o jogo começou
            await interaction.editReply({ content: '✅ O botão para iniciar o Jogo da Forca foi enviado ao canal!' });

        } catch (error) {
            console.error('[FORCA] Erro ao criar o botão de início:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao tentar iniciar o jogo.' });
        }
    }
};