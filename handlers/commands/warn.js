// Crie em: handlers/commands/warn.js
const executePunishment = require('../../utils/modUtils.js');

module.exports = {
    customId: 'warn',
    async execute(interaction) {
        const targetMember = interaction.options.getMember('membro');
        const reason = interaction.options.getString('motivo');
        
        await executePunishment(interaction, 'warn', targetMember, reason);
    }
};