const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tocar')
        .setDescription('Toca uma música do SoundCloud')
        .addStringOption(option => 
            option.setName('busca')
                .setDescription('Nome ou Link do SoundCloud')
                .setRequired(true)),
    // A execução real acontece no handler acima, mas se seu bot roda direto aqui:
    // async execute(interaction) { ... } 
};