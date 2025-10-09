// Crie este arquivo em: commands/ranking.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ranking')
        .setDescription('Mostra o ranking de pontos do Jogo da Forca.'),
};