// Crie em: commands/timeout.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Silencia um membro por um tempo determinado.')
        .addUserOption(option => 
            option.setName('membro')
                .setDescription('O membro a ser silenciado')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duracao')
                .setDescription('A duração do silenciamento (ex: 10m, 1h, 7d)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('motivo')
                .setDescription('O motivo do silenciamento')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
};