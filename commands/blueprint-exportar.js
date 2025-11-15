const { SlashCommandBuilder } = require('discord.js');
const { V2_FLAG } = require('../utils/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blueprint-exportar')
        .setDescription('Cria um blueprint (snapshot) da arquitetura atual do servidor. (Dev)')
        .addStringOption(option =>
            option.setName('nome')
                .setDescription('O nome de identificação para este blueprint.')
                .setRequired(true)
        ),
    v2: V2_FLAG,
    devOnly: true, // <-- ADICIONE ESTA LINHA
    execute: async (interaction, client) => {
        // A lógica está no handler
    }
};