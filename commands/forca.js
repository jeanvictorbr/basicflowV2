// Crie em: commands/forca.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('forca')
        .setDescription('Inicia um novo jogo da Forca no canal atual.'),
};