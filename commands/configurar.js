// Substitua o conteúdo em: commands/configurar.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('configurar')
        .setDescription('Abre o Hub de Configurações do bot.'),

    // A função 'execute' foi removida daqui e movida para /handlers/commands/configurar.js
};