// Crie em: commands/ban.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bane um membro do servidor.')
        .addUserOption(option => 
            option.setName('membro')
                .setDescription('O membro a ser banido')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('motivo')
                .setDescription('O motivo do banimento')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duracao')
                .setDescription('Duração do ban (premium, ex: 7d). Deixe em branco para permanente.')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
};