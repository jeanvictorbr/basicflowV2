// File: commands/membros.js
// CONTEÚDO COMPLETO

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('membros')
        .setDescription('Abre o painel de administração de membros verificados (Somente DEV).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Um filtro inicial, a verificação final é no handler
};