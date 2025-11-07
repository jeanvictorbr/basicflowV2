// Caminho: commands/enviardm.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enviardm')
        .setDescription('Envia uma mensagem privada para todos os membros do servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false), // Garante que o comando só pode ser usado em um servidor
};