const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('anunciar')
		.setDescription('📢 Envia uma mensagem de anúncio para um canal específico.')
		.addChannelOption(option =>
			option.setName('canal')
				.setDescription('O canal onde o anúncio será enviado.')
				.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	category: 'moderation',
};