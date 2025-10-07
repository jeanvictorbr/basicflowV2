// Crie em: handlers/buttons/main_menu_page.js
const generateMainMenu = require('../../ui/mainMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'main_menu_page_', // Handler dinâmico
    async execute(interaction) {
        const page = parseInt(interaction.customId.split('_')[3], 10);
        if (isNaN(page)) return;

        const mainMenuComponents = await generateMainMenu(interaction, page);
        await interaction.update({
            components: mainMenuComponents,
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};