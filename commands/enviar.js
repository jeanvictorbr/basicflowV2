// Crie em: commands/enviar.js
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enviar')
        .setDescription('Pede para a IA escrever e enviar uma mensagem em um canal específico.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Apenas admins podem usar
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('O canal para onde a mensagem será enviada.')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('O que você quer que a IA escreva. Dê o máximo de detalhes possível.')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('mencionar_usuario')
                .setDescription('(Opcional) O usuário que será mencionado no início da mensagem.')
                .setRequired(false)),
};