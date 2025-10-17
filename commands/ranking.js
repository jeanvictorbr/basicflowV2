// commands/ranking.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ranking')
        .setDescription('Abre a central de rankings Glogal e Local.'),
};