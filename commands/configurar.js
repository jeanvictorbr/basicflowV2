// commands/configurar.js
const { SlashCommandBuilder } = require('discord.js');
const mainMenuComponents = require('../ui/mainMenu.js'); // Importa o menu principal dinamicamente

module.exports = {
    data: new SlashCommandBuilder()
        .setName('configurar')
        .setDescription('Abre o Hub de Configurações do bot.'),

    async execute(interaction) {
        // Usando a estrutura importada diretamente do seu arquivo ui/mainMenu.js
        // Isso garante que qualquer mudança no design seja refletida aqui automaticamente.
        await interaction.reply({
            components: mainMenuComponents,
            ephemeral: true,
        });
    },
};