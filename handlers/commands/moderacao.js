// Crie em: handlers/commands/moderacao.js
const generateModeracaoHub = require('../../ui/moderacaoHub.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'moderacao',
    async execute(interaction) {
        await interaction.reply({
            components: generateModeracaoHub(interaction),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};