// commands/configurar.js
const { SlashCommandBuilder } = require('discord.js');
const generateMainMenu = require('../ui/mainMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('configurar')
        .setDescription('Abre o Hub de Configurações do bot.'),

    async execute(interaction) {
        // AQUI ESTÁ A MUDANÇA: Passamos 'interaction' e a página inicial '0'
        const mainMenuComponents = await generateMainMenu(interaction, 0); 
        await interaction.reply({
            components: mainMenuComponents,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    },
};