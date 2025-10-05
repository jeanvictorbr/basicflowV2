// commands/configurar.js
const { SlashCommandBuilder } = require('discord.js');
const mainMenuComponents = require('../ui/mainMenu.js');

// As flags que o Discord precisa para entender a mensagem.
// Vamos usá-las explicitamente para garantir a compatibilidade.
const V2_FLAG = 1 << 15;       // Flag para ativar os componentes v2 (Post)
const EPHEMERAL_FLAG = 1 << 6;  // Flag para tornar a mensagem efêmera

module.exports = {
    data: new SlashCommandBuilder()
        .setName('configurar')
        .setDescription('Abre o Hub de Configurações do bot.'),

    async execute(interaction) {
        // Usando o método .reply() com as flags combinadas.
        // Isso força a API do Discord a interpretar corretamente seu design V2.
        await interaction.reply({
            components: mainMenuComponents,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    },
};