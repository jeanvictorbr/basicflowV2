const { SlashCommandBuilder } = require('discord.js');
const { V2_FLAG } = require('../utils/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blueprint-importar')
        .setDescription('Lista os seus blueprints salvos para importação neste servidor. (Dev)'),
    v2: V2_FLAG,
    devOnly: true, // <-- ADICIONE ESTA LINHA
    execute: async (interaction, client) => {
        // A lógica está no handler
    }
};