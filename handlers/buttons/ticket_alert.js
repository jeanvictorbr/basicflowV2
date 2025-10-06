// handlers/buttons/ticket_alert.js
const db = require('../../database.js');
const generateTicketDashboard = require('../../ui/ticketDashboard.js');

module.exports = {
    customId: 'ticket_alert',
    async execute(interaction) {
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        if (!interaction.member.roles.cache.has(settings.tickets_cargo_suporte)) {
            return interaction.reply({ content: '❌ Você não tem permissão para usar este botão.', ephemeral: true });
        }

        await interaction.deferUpdate();
        const ticket = (await db.query('SELECT user_id FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        if (ticket) {
            const newAction = `> Usuário <@${ticket.user_id}> alertado por ${interaction.user}.\n`;
            await db.query(`UPDATE tickets SET action_log = action_log || $1 WHERE channel_id = $2`, [newAction, interaction.channel.id]);
            await interaction.channel.send(`🔔 <@${ticket.user_id}>, a equipe de suporte precisa da sua atenção!`);
            
            const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
            const openerMember = await interaction.guild.members.fetch(ticketData.user_id).catch(() => null);
            
            // CORREÇÃO: Passa o interaction.member do admin
            const dashboard = generateTicketDashboard(ticketData, openerMember, interaction.member, settings.tickets_cargo_suporte);
            await interaction.editReply({ ...dashboard });
        }
    }
};