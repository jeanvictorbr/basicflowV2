// Substitua o conteúdo em: commands/devpanel.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('devpanel')
        .setDescription('Abre o painel de controle do desenvolvedor.')
        // Garante que o comando só seja visível para administradores
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
};