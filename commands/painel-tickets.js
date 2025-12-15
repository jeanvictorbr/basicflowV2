const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('painel-tickets')
        .setDescription('Painel Admin para gerenciar tickets abertos')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    // Configurações do seu bot
    adminOnly: true,
    category: 'admin' 
};