// commands/dossie.js
const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Ver Dossiê')
        .setType(ApplicationCommandType.User),
    // A lógica de execução fica no handler correspondente
};