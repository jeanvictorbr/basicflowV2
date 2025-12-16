const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('elogiar')
        .setDescription('Dá um ponto de reputação para um usuário (1x por dia).')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('Quem você quer elogiar?')
                .setRequired(true)),
    async execute(interaction) {
        // Lógica no handler
    },
};