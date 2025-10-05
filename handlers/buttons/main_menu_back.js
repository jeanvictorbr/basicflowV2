// handlers/buttons/main_menu_back.js
const mainMenuComponents = require('../../ui/mainMenu.js');

const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'main_menu_back',
    async execute(interaction) {
        await interaction.update({
            components: mainMenuComponents,
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};