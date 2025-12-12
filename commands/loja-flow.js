const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loja-flow')
        .setDescription('🛒 [FlowCoins] Troque suas moedas por funcionalidades para seu servidor.'),
};