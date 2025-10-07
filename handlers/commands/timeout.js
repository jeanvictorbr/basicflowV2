// Crie em: handlers/commands/timeout.js
const executePunishment = require('../../utils/modUtils.js');

module.exports = {
    customId: 'timeout',
    async execute(interaction) {
        const targetMember = interaction.options.getMember('membro');
        const reason = interaction.options.getString('motivo');
        const duration = interaction.options.getString('duracao');
        
        await executePunishment(interaction, 'timeout', targetMember, reason, duration);
    }
};