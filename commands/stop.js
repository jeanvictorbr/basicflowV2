// Crie este arquivo em: commands/stop.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Inicia uma nova rodada do jogo Stop! (Adedanha).')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
        .addStringOption(option =>
            option.setName('categorias')
                .setDescription('As categorias do jogo, separadas por vírgula (ex: Nome, Cor, Carro)')
                .setRequired(true)),
};