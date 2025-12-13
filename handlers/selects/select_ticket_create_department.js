// handlers/selects/select_ticket_create_department.js
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
            return interaction.editReply({ content: '❌ Departamento não encontrado.', ephemeral: true });
        }

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const category = await interaction.guild.channels.fetch(settings.tickets_category).catch(() => null);
        
        if (!category) {
            return interaction.editReply({ content: '❌ Categoria de tickets inválida.', ephemeral: true });
        }

        try {
            const ticketCountResult = await db.query('SELECT ticket_number FROM tickets WHERE guild_id = $1 ORDER BY ticket_number DESC LIMIT 1', [interaction.guild.id]);
            const nextTicketNumber = (ticketCountResult.rows[0]?.ticket_number || 0) + 1;
            
            // --- LÓGICA DE PERMISSÕES MÚLTIPLAS ---
            const permissionOverwrites = [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles] }
            ];

            let departmentRoles = [];
            let mentionString = '';

            // Tenta ler como JSON (formato novo) ou string única (formato antigo)
            try {
                const parsed = JSON.parse(department.role_id);
                if (Array.isArray(parsed)) {
                    departmentRoles = parsed; // É um array de IDs
                } else {
                    departmentRoles = [department.role_id]; // É um ID único
                }
            } catch (e) {
                // Se der erro no parse, é porque é um ID antigo (string pura)
                if (department.role_id) departmentRoles = [department.role_id];
            }

            // Adiciona permissões para CADA cargo do departamento
            if (departmentRoles.length > 0) {
                departmentRoles.forEach(roleId => {
                    permissionOverwrites.push({
                        id: roleId,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageMessages]
                    });
                    mentionString += `<@&${roleId}> `;
                });
            } else if (settings.tickets_cargo_suporte) {
                // Fallback: Se não tiver cargos definidos, usa o Geral
                permissionOverwrites.push({
                    id: settings.tickets_cargo_suporte,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageMessages]
                });
                mentionString = `<@&${settings.tickets_cargo_suporte}>`;
            }
            // ---------------------------------------

            const channelName = `${department.emoji ? department.emoji + '-' : ''}ticket-${String(nextTicketNumber).padStart(4, '0')}`;

            const channel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: category,
                topic: `Ticket #${nextTicketNumber} | Dept: ${department.name} | User: ${interaction.user.id}`,
                permissionOverwrites: permissionOverwrites
            });
            
            const initialLog = `> Ticket #${nextTicketNumber} aberto por <@${interaction.user.id}> no departamento **${department.name}**.\n`;
            await db.query('INSERT INTO tickets (channel_id, guild_id, user_id, action_log, ticket_number) VALUES ($1, $2, $3, $4, $5)', [channel.id, interaction.guild.id, interaction.user.id, initialLog, nextTicketNumber]);

            const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [channel.id])).rows[0];
            const dashboard = generateTicketDashboard(ticketData, interaction.member);

            await channel.send({ content: `${interaction.user} ${mentionString}`, ...dashboard });

            // Saudação
            if (settings.tickets_greeting_enabled) {
                const activeMessages = (await db.query('SELECT message FROM ticket_greeting_messages WHERE guild_id = $1 AND is_active = true ORDER BY id ASC', [interaction.guild.id])).rows;
                const sendSequentially = async () => {
                    for (const msg of activeMessages) {
                        const formattedMessage = msg.message
                            .replace('{user}', `<@${interaction.user.id}>`)
                            .replace('{server}', interaction.guild.name);
                        await channel.send({ content: formattedMessage });
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                };
                sendSequentially();
            }

            await interaction.editReply({ content: `✅ Ticket criado: ${channel}`, components: [] });

        } catch (error) {
            console.error("Erro Ticket Create:", error);
            await interaction.editReply({ content: '❌ Erro ao criar ticket.', components: [] });
        }
    }
};