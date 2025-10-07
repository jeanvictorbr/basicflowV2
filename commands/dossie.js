// Crie em: commands/dossie.js
const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Ver Dossiê')
        .setType(ApplicationCommandType.User),
    // A lógica de execução será colocada num handler separado para manter a organização
    // e será chamada dinamicamente pelo index.js
};