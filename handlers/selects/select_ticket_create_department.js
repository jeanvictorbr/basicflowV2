// Crie em: handlers/selects/select_ticket_create_department.js
const { ChannelType, PermissionsBitField } = require('discord.js');
const db = require('../../database.js');
const generateTicketDashboard = require('../../ui/ticketDashboard.js');

module.exports = {
    customId: 'select_ticket_create_department_',
    async execute(interaction) {
        await interaction.deferUpdate();

        const departmentId = interaction.values[0];
        const department = (await db.query('SELECT * FROM ticket_departments WHERE id = $1', [departmentId])).rows[0];
        if (!department) {
            return interaction.editReply({ content: 'Departamento não encontrado. Tente novamente.', ephemeral: true });
        }

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const category = await interaction.guild.channels.fetch(settings.tickets_category).catch(() => null);
        if (!category) {
            return interaction.editReply({ content: 'A categoria para criar tickets não foi encontrada. Contate um administrador.', ephemeral: true });
        }

        try {
            const ticketCountResult = await db.query('SELECT ticket_number FROM tickets WHERE guild_id = $1 ORDER BY ticket_number DESC LIMIT 1', [interaction.guild.id]);
            const nextTicketNumber = (ticketCountResult.rows[0]?.ticket_number || 0) + 1;
            const channelName = `${department.emoji ? department.emoji + '-' : ''}ticket-${String(nextTicketNumber).padStart(4, '0')}`;

            const channel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: category,
                topic: `Ticket #${nextTicketNumber} | Dept: ${department.name} | Aberto por ${interaction.user.tag}. ID: ${interaction.user.id}`,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles] },
                    { id: department.role_id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.ManageMessages] },
                    // Garante que o cargo de suporte padrão também veja, caso não seja o mesmo do depto.
                    { id: settings.tickets_cargo_suporte, allow: [PermissionsBitField.Flags.ViewChannel] }
                ],
            });
            
            const initialLog = `> Ticket #${nextTicketNumber} aberto por <@${interaction.user.id}> no departamento **${department.name}**.\n`;
            await db.query('INSERT INTO tickets (channel_id, guild_id, user_id, action_log) VALUES ($1, $2, $3, $4)', [channel.id, interaction.guild.id, interaction.user.id, initialLog]);

            const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [channel.id])).rows[0];
            const dashboard = generateTicketDashboard(ticketData, interaction.member);

            await channel.send({ content: `${interaction.user} <@&${department.role_id}>`, ...dashboard });

            // INSERÇÃO DA MENSAGEM DE SAUDAÇÃO
            if (settings.tickets_greeting_enabled && settings.tickets_greeting_message) {
                const greeting = settings.tickets_greeting_message
                    .replace('{user}', `<@${interaction.user.id}>`)
                    .replace('{server}', interaction.guild.name);
                await channel.send({ content: greeting });
            }

            await interaction.editReply({ content: `✅ Seu ticket foi criado em ${channel}!`, components: [] });

        } catch (error) {
            console.error("Erro ao criar ticket (departamento):", error);
            await interaction.editReply({ content: 'Ocorreu um erro ao criar seu ticket. Verifique minhas permissões.', components: [] });
        }
    }
};