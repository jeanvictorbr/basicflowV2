// Crie este novo arquivo em: handlers/commands/configurar.js
const generateMainMenu = require('../../ui/mainMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'configurar',
    async execute(interaction) {
        // Adia a resposta para ganhar mais tempo de processamento.
        await interaction.deferReply({ ephemeral: true });

        // A lógica para gerar o menu continua a mesma
        const mainMenuComponents = await generateMainMenu(interaction, 0); 
        
        // Usa editReply para enviar a resposta final.
        await interaction.editReply({
            components: mainMenuComponents,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    },
};