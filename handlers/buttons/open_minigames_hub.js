// Crie este arquivo em: handlers/buttons/open_minigames_hub.js
const generateMinigamesHub = require('../../ui/minigamesHub.js');

module.exports = {
    customId: 'open_minigames_hub',
    async execute(interaction) {
        await interaction.update(generateMinigamesHub());
    }
};