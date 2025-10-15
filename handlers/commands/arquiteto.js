// Crie em: handlers/commands/arquiteto.js
const generateArchitectMenu = require('../../ui/guildArchitect/mainMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'arquiteto',
    async execute(interaction) {
        await interaction.reply({
            components: generateArchitectMenu(),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};