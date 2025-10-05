// commands/configurar.js
const { SlashCommandBuilder } = require('discord.js');
const mainMenuComponents = require('../ui/mainMenu.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('configurar')
        .setDescription('Abre o Hub de Configurações do bot.'),

    async execute(interaction) {
        // Para garantir que a estrutura complexa do seu JSON (type: 17) seja enviada corretamente
        // para a API do Discord, usamos a API REST do cliente para enviar a resposta.
        // Isso evita que o discord.js valide a estrutura e nos dá controle total.

        await interaction.client.rest.post(
            `/interactions/${interaction.id}/${interaction.token}/callback`,
            {
                body: {
                    type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
                    data: {
                        components: mainMenuComponents,
                        flags: 1 << 6, // EPHEMERAL FLAG
                    },
                },
            }
        );
    },
};