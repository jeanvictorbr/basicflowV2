// Crie em: handlers/commands/ban.js
const executePunishment = require('../../utils/modUtils.js');

module.exports = {
    customId: 'ban',
    async execute(interaction) {
        const targetMember = interaction.options.getUser('membro'); // getUser para poder banir por ID
        const reason = interaction.options.getString('motivo');
        const duration = interaction.options.getString('duracao') || null;
        
        await executePunishment(interaction, 'ban', targetMember, reason, duration);
    }
};