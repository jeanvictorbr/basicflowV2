// Crie em: handlers/buttons/dev_guilds_sort_.js
const db = require('../../database.js');
const generateDevGuildsMenu = require('../../ui/devPanel/devGuildsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

// Reutiliza a mesma lógica de busca de dados do handler principal
const { execute: fetchAndPrepareGuilds } = require('./dev_manage_guilds.js');

module.exports = {
    customId: 'dev_guilds_sort_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const sortKey = interaction.customId.split('_')[3];
        
        // Chama a lógica de busca de dados, mas passando a chave de ordenação
        await fetchAndPrepareGuilds(interaction, sortKey);
    }
};