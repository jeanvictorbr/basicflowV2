// Crie este arquivo em: handlers/commands/stop.js
const db = require('../../database.js');
const generateStopDashboard = require('../../ui/stopGameDashboard.js');

const ALPHABET = 'ABCDEFGHIJKLMNOPRSTUV';

module.exports = {
    customId: 'stop',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const existingGame = await db.query('SELECT 1 FROM stop_games WHERE channel_id = $1', [interaction.channel.id]);
        if (existingGame.rows.length > 0) {
            return interaction.editReply({ content: '❌ Já existe um jogo de Stop! em andamento neste canal.' });
        }

        const categories = interaction.options.getString('categorias');
        const letter = ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));

        const game = {
            letter,
            categories,
            status: 'playing',
            starter_id: interaction.user.id
        };
        
        const gameMessage = await interaction.channel.send(generateStopDashboard(game));

        await db.query(
            `INSERT INTO stop_games (message_id, channel_id, guild_id, letter, categories, starter_id) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [gameMessage.id, interaction.channel.id, interaction.guild.id, letter, categories, interaction.user.id]
        );

        await interaction.editReply({ content: '✅ Jogo Stop! iniciado com sucesso!' });
    }
};