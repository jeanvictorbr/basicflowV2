// Crie em: commands/kick.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa um membro do servidor.')
        .addUserOption(option => 
            option.setName('membro')
                .setDescription('O membro a ser expulso')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('motivo')
                .setDescription('O motivo da expulsão')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
};