const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('falar')
        .setDescription('📢 Faz o bot enviar uma mensagem no canal atual.')
        .addStringOption(option =>
            option.setName('mensagem')
                .setDescription('A mensagem que o bot deve enviar')
                .setRequired(true))
        .addBooleanOption(option => 
            option.setName('embed')
                .setDescription('Enviar como um Embed bonito? (Padrão: Não)')
                .setRequired(false)),
    adminOnly: true, // Restrito para Admins
    async execute(interaction, settings) {
        // Lógica no handler
    }
};