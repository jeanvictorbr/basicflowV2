const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('ℹ️ Exibe informações detalhadas sobre este servidor.'),
    adminOnly: false, // Público
    async execute(interaction, settings) {
        // Lógica no handler
    }
};