// commands/meuspedidos.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meuspedidos')
        .setDescription('📂 [Loja] Veja seu histórico de compras e recupere produtos.'),
    // Permite que qualquer um use, mas a resposta será privada
    async execute(interaction, guildSettings) {
        // A lógica é delegada para o handler
    },
};