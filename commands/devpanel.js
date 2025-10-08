// commands/devpanel.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('devpanel')
        .setDescription('Abre o painel de controle do desenvolvedor.'),
};