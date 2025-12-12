const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-voice')
        .setDescription('Configura o sistema de Voz Temporária (Join-to-Create)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // APENAS ADMINS
        .addChannelOption(option => 
            option.setName('canal')
                .setDescription('O canal de voz que servirá de gatilho')
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(true))
        .addChannelOption(option => 
            option.setName('categoria')
                .setDescription('A categoria onde as salas temporárias serão criadas')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(false))
};