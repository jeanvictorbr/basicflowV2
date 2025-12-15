const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('convidar-workers')
        .setDescription('📥 Receba os links para adicionar os Bots de Música ao servidor')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const handler = interaction.client.commandHandlers.get('convidar-workers');
        if (handler) await handler(interaction);
    }
};