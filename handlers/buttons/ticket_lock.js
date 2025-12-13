// handlers/buttons/ticket_lock.js
const { PermissionsBitField } = require('discord.js');
const db = require('../../database.js');
const generateTicketDashboard = require('../../ui/ticketDashboard.js');

module.exports = {
    customId: 'ticket_lock',
    async execute(interaction) {
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];

        // --- NOVA LÓGICA DE PERMISSÃO ---
        let hasPermission = false;
        if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) hasPermission = true;
        else {
            const channelOverwrites = interaction.channel.permissionOverwrites.cache;
            const isDepartmentStaff = interaction.member.roles.cache.some(r => {
                const overwrite = channelOverwrites.get(r.id);
                return overwrite && overwrite.allow.has(PermissionsBitField.Flags.ManageMessages);
            });
            if (isDepartmentStaff) hasPermission = true;
            if (settings.tickets_cargo_suporte && interaction.member.roles.cache.has(settings.tickets_cargo_suporte)) hasPermission = true;
        }

        if (!hasPermission) {
            return interaction.reply({ content: '⛔ Sem permissão para trancar este ticket.', ephemeral: true });
        }
        // --------------------------------

        await interaction.deferUpdate();
        const ticket = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        
        if (!ticket) return interaction.followUp({ content: 'Ticket não encontrado.', ephemeral: true });

        const user = await interaction.guild.members.fetch(ticket.user_id).catch(() => null);
        
        // Alterna status
        const newStatus = ticket.status === 'locked' ? 'open' : 'locked';
        const actionText = newStatus === 'locked' ? 'trancado' : 'destrancado';
        const logAction = `> Ticket ${actionText} por ${interaction.user}.\n`;

        // Se o usuário ainda estiver no servidor, atualiza permissão dele
        if (user) {
            await interaction.channel.permissionOverwrites.edit(user, { 'SendMessages': newStatus !== 'locked' });
        }

        await db.query('UPDATE tickets SET status = $1, action_log = action_log || $2 WHERE channel_id = $3', [newStatus, logAction, interaction.channel.id]);
        
        // Atualiza a dashboard (sem recriar nova mensagem)
        const updatedTicketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        
        // Usa o member de quem clicou (Staff) para gerar a UI atualizada
        const dashboard = generateTicketDashboard(updatedTicketData, interaction.member); 
        
        await interaction.editReply({ ...dashboard });
    }
};