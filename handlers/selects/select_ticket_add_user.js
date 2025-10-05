// Crie em: handlers/selects/select_ticket_add_user.js
const { PermissionsBitField } = require('discord.js');
const generateTicketDashboard = require('../../ui/ticketDashboard.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_ticket_add_user',
    async execute(interaction) {
        const memberId = interaction.values[0];
        const member = await interaction.guild.members.fetch(memberId);
        await interaction.channel.permissionOverwrites.edit(member, { ViewChannel: true, SendMessages: true });
        
        const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        await interaction.update({ components: generateTicketDashboard(ticketData), flags: V2_FLAG | EPHEMERAL_FLAG });
        await interaction.followUp({ content: `${member} foi adicionado ao ticket por ${interaction.user}.`, ephemeral: false });
    }
};