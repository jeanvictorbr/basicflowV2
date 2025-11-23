const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('limpar')
        .setDescription('🧹 Apaga uma quantidade específica de mensagens neste canal.')
        .addIntegerOption(option =>
            option.setName('quantidade')
                .setDescription('Número de mensagens para apagar (1 a 100)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)),
    adminOnly: true, // Restringe apenas para administradores
    async execute(interaction, settings) {
        // A lógica é executada pelo handler
    }
};