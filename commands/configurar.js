// commands/configurar.js
const { SlashCommandBuilder } = require('discord.js');
const mainMenuComponents = require('../ui/mainMenu.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('configurar')
        .setDescription('Abre o Hub de Configurações do bot.'),

    async execute(interaction) {
        await interaction.reply({
            components: mainMenuComponents,
            ephemeral: true,
        });
    },
};