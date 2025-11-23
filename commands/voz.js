const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('voz')
        .setDescription('🔊 Coloca o bot em um canal de voz (Modo Suporte/AFK).'),
    adminOnly: true, // Restringe apenas para administradores
    module: 'SYSTEM',
    async execute(interaction, settings) {
        // A lógica é executada pelo handler
    }
};