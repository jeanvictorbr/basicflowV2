// Crie em: handlers/buttons/mod_open_hub.js
const generateModeracaoHub = require('../../ui/moderacaoHub.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_open_hub',
    async execute(interaction) {
        await interaction.update({
            components: generateModeracaoHub(interaction),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};