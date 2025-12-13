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
            return interaction.editReply({ content: '❌ Departamento não encontrado ou removido.', ephemeral: true });
        }

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const category = await interaction.guild.channels.fetch(settings.tickets_category).catch(() => null);
        
        if (!category) {
            return interaction.editReply({ content: '❌ A categoria de tickets não foi configurada corretamente.', ephemeral: true });
        }

        try {
            // Gera número do ticket
            const ticketCountResult = await db.query('SELECT ticket_number FROM tickets WHERE guild_id = $1 ORDER BY ticket_number DESC LIMIT 1', [interaction.guild.id]);
            const nextTicketNumber = (ticketCountResult.rows[0]?.ticket_number || 0) + 1;
            
            // Define permissões de forma EXCLUSIVA
            const permissionOverwrites = [
                { 
                    id: interaction.guild.id, 
                    deny: [PermissionsBitField.Flags.ViewChannel] // Ninguém vê
                },
                { 
                    id: interaction.user.id, 
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles] 
                }
            ];

            // LÓGICA DE CARGO EXCLUSIVO
            if (department.role_id) {
                // Se tem cargo de departamento, SÓ ELE entra (além do usuário)
                permissionOverwrites.push({ 
                    id: department.role_id, 
                    allow: [
                        PermissionsBitField.Flags.ViewChannel, 
                        PermissionsBitField.Flags.SendMessages, 
                        PermissionsBitField.Flags.ReadMessageHistory, 
                        PermissionsBitField.Flags.AttachFiles, 
                        PermissionsBitField.Flags.ManageMessages // Permissão para administrar
                    ] 
                });
            } else if (settings.tickets_cargo_suporte) {
                // Fallback: Se o departamento NÃO tem cargo, usa o Suporte Geral
                permissionOverwrites.push({ 
                    id: settings.tickets_cargo_suporte, 
                    allow: [
                        PermissionsBitField.Flags.ViewChannel, 
                        PermissionsBitField.Flags.SendMessages, 
                        PermissionsBitField.Flags.ReadMessageHistory, 
                        PermissionsBitField.Flags.AttachFiles, 
                        PermissionsBitField.Flags.ManageMessages
                    ] 
                });
            }

            const channelName = `${department.emoji ? department.emoji + '-' : ''}ticket-${String(nextTicketNumber).padStart(4, '0')}`;

            const channel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: category,
                topic: `Ticket #${nextTicketNumber} | Dept: ${department.name} | Aberto por ${interaction.user.tag} (${interaction.user.id})`,
                permissionOverwrites: permissionOverwrites
            });
            
            const initialLog = `> Ticket #${nextTicketNumber} aberto por <@${interaction.user.id}> no departamento **${department.name}**.\n`;
            await db.query('INSERT INTO tickets (channel_id, guild_id, user_id, action_log, ticket_number) VALUES ($1, $2, $3, $4, $5)', [channel.id, interaction.guild.id, interaction.user.id, initialLog, nextTicketNumber]);

            const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [channel.id])).rows[0];
            const dashboard = generateTicketDashboard(ticketData, interaction.member);

            // Menção inteligente (apenas quem pode ver)
            const mentionRole = department.role_id ? `<@&${department.role_id}>` : (settings.tickets_cargo_suporte ? `<@&${settings.tickets_cargo_suporte}>` : '');
            await channel.send({ content: `${interaction.user} ${mentionRole}`, ...dashboard });

            // Mensagens de Saudação (se ativas)
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

            await interaction.editReply({ content: `✅ Ticket criado com sucesso: ${channel}`, components: [] });

        } catch (error) {
            console.error("Erro ao criar ticket:", error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao criar o ticket. Verifique as permissões do bot.', components: [] });
        }
    }
};