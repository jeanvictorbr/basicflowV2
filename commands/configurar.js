// commands/configurar.js
const { SlashCommandBuilder } = require('discord.js');
const mainMenuComponents = require('../ui/mainMenu.js'); // Importa o menu principal dinamicamente

module.exports = {
    data: new SlashCommandBuilder()
        .setName('configurar')
        .setDescription('Abre o Hub de Configurações do bot.'),

    async execute(interaction) {
        // Agora, o comando envia a versão mais atualizada do seu menu,
        // com os IDs corretos ('open_ausencias_menu', etc.)
        await interaction.reply({
            components: mainMenuComponents,
            ephemeral: true,
        });
    },
};