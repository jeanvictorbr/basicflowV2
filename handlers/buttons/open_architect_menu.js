// Crie em: handlers/buttons/open_architect_menu.js
const generateArchitectMenu = require('../../ui/guildArchitect/mainMenu.js');
const hasFeature = require('../../utils/featureCheck.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'open_architect_menu',
    async execute(interaction) {
        if (!await hasFeature(interaction.guild.id, 'ARQUITETO')) {
            return interaction.reply({ content: 'Esta é uma funcionalidade premium. Ative uma chave para usá-la.', ephemeral: true });
        }
        
        await interaction.update({
            components: generateArchitectMenu(),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};