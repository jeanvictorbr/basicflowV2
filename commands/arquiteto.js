// Crie em: commands/arquiteto.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('arquiteto')
        .setDescription('Inicia o assistente de IA para configurar um novo servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
};