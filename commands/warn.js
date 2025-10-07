// Crie em: commands/warn.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Aplica um aviso a um membro.')
        .addUserOption(option => 
            option.setName('membro')
                .setDescription('O membro a ser avisado')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('motivo')
                .setDescription('O motivo do aviso')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
};