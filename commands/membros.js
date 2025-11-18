// Local: commands/membros.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('membros')
        .setDescription('Abre o painel de administração de membros verificados (Somente DEV).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    // Flags personalizadas para o seu bot identificar
    adminOnly: true, 
    module: 'automations' 
};