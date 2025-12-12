const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('💰 [FlowCoins] Resgate suas moedas diárias para comprar features.'),
    // O handler será carregado automaticamente pelo nome do arquivo
};