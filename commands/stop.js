// Substitua o conteúdo em: commands/stop.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Inicia uma nova rodada do jogo Stop! (Adedanha).')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages), // Agora todos podem iniciar
};