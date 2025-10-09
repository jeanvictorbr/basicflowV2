// Crie em: handlers/commands/forca.js
const db = require('../../database.js');
const { getRandomWord } = require('../../utils/wordlist.js');
const generateHangmanDashboard = require('../../ui/hangmanDashboard.js');

const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'forca',
    async execute(interaction) {
        // Resposta efêmera inicial para confirmar o recebimento do comando
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
            guessed_letters: '',
            lives: 6,
            action_log: initialLog,
            status: 'playing' // Status inicial
        };

        // 3. Gera o dashboard inicial
        const dashboard = generateHangmanDashboard(gameData);

        try {
            // 4. Envia o dashboard para o canal (não pode ser efêmero)
            const gameMessage = await interaction.channel.send({
                components: dashboard,
                flags: V2_FLAG
            });

            // 5. Salva o jogo no banco de dados, incluindo o ID da mensagem
            await db.query(
                `INSERT INTO hangman_games (channel_id, guild_id, user_id, secret_word, action_log, message_id) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [gameData.channel_id, gameData.guild_id, gameData.user_id, gameData.secret_word, gameData.action_log, gameMessage.id]
            );

            // 6. Confirma para o usuário que o jogo começou
            await interaction.editReply({ content: '✅ Jogo da forca iniciado com sucesso no canal!' });

        } catch (error) {
            console.error('[FORCA] Erro ao iniciar o jogo:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao tentar iniciar o jogo. Verifique as permissões do bot.' });
        }
    }
};