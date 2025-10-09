// Substitua o conteúdo em: handlers/commands/stop.js
const db = require('../../database.js');
const generateStopDashboard = require('../../ui/stopGameDashboard.js');

const ALPHABET = 'ABCDEFGHIJKLMNOPRSTUV';
const DEFAULT_CATEGORIES = "Nome,Cor,Carro,Cidade,Fruta,País,Objeto";

module.exports = {
    customId: 'stop',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const existingGame = await db.query('SELECT 1 FROM stop_games WHERE channel_id = $1 AND status != $2', [interaction.channel.id, 'finished']);
        if (existingGame.rows.length > 0) {
            return interaction.editReply({ content: '❌ Já existe um jogo de Stop! em andamento neste canal.' });
        }

        let categoriesResult = await db.query('SELECT name FROM stop_categories WHERE guild_id = $1', [interaction.guild.id]);
        let categories = categoriesResult.rows.map(r => r.name).join(',');
        if (!categories) {
            categories = DEFAULT_CATEGORIES;
        }

        const letter = ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));

        const game = { letter, categories, status: 'playing', starter_id: interaction.user.id };
        
        const gameMessage = await interaction.channel.send(generateStopDashboard(game));

        await db.query(
            `INSERT INTO stop_games (message_id, channel_id, guild_id, letter, categories, starter_id) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [gameMessage.id, interaction.channel.id, interaction.guild.id, letter, categories, interaction.user.id]
        );

        await interaction.editReply({ content: '✅ Jogo Stop! iniciado com sucesso!' });
    }
};