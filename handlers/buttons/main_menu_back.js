const mainMenuComponents = require('../../ui/mainMenu.js');
module.exports = {
    customId: 'main_menu_back',
    async execute(interaction) {
        await interaction.update({ embeds: [], components: mainMenuComponents });
    }
};