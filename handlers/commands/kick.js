// Crie em: handlers/commands/kick.js
const executePunishment = require('../../utils/modUtils.js');

module.exports = {
    customId: 'kick',
    async execute(interaction) {
        const targetMember = interaction.options.getMember('membro');
        const reason = interaction.options.getString('motivo');
        
        await executePunishment(interaction, 'kick', targetMember, reason);
    }
};