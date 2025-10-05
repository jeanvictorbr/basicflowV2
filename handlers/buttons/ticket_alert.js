// Crie em: handlers/buttons/ticket_alert.js
module.exports = {
    customId: 'ticket_alert',
    async execute(interaction) {
        await interaction.deferUpdate();
        const ticket = (await require('../../database.js').query('SELECT user_id FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        if (ticket) {
            await interaction.channel.send(`🔔 <@${ticket.user_id}>, a equipe de suporte precisa da sua atenção!`);
        }
    }
};