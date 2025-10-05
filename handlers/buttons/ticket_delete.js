// Crie em: handlers/buttons/ticket_delete.js
const db = require('../../database.js');

module.exports = {
    customId: 'ticket_delete',
    async execute(interaction) {
        await interaction.reply({ content: 'O ticket será deletado em 5 segundos...', ephemeral: true });
        setTimeout(async () => {
            await interaction.channel.delete();
            await db.query('DELETE FROM tickets WHERE channel_id = $1', [interaction.channel.id]);
        }, 5000);
    }
};