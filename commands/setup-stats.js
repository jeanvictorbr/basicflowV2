const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    // ESTA PROPRIEDADE 'data' É OBRIGATÓRIA AQUI
    data: new SlashCommandBuilder()
        .setName('setup-stats')
        .setDescription('Cria os canais de contagem de membros e clientes no topo do servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    // A lógica de execução fica no handler, não aqui.
};