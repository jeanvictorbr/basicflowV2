// Substitua o conteúdo em: commands/devpanel.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('devpanel')
        .setDescription('Abre o painel de controle do desenvolvedor.')
        // --- LINHAS ADICIONADAS ---
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Apenas administradores podem ver/usar
        .setDMPermission(false), // Não pode ser usado em DMs
};