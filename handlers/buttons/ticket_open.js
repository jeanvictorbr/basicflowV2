// handlers/buttons/ticket_open.js
const { ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const generateTicketDashboard = require('../../ui/ticketDashboard.js');
const generateDepartmentSelect = require('../../ui/ticketDepartmentSelect.js');
const generateDmWelcomeEmbed = require('../../ui/tickets/dmWelcomeEmbed.js');
const generateDmStaffControlEmbed = require('../../ui/tickets/dmStaffControlEmbed.js');

module.exports = {
    customId: 'ticket_open',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        if (!settings?.tickets_category || !settings?.tickets_cargo_suporte) {
            return interaction.editReply('❌ O sistema de tickets não está configurado. Um administrador precisa definir a Categoria e o Cargo de Suporte.');
        }

        const existingTicket = (await db.query('SELECT * FROM tickets WHERE user_id = $1 AND guild_id = $2 AND status != $3', [interaction.user.id, interaction.guild.id, 'closed'])).rows[0];
        if (existingTicket) {
            const channel = interaction.guild.channels.cache.get(existingTicket.channel_id) || `ID: ${existingTicket.channel_id}`;
            return interaction.editReply(`⚠️ Você já possui um ticket aberto em ${channel}.`);
        }

        // --- ROTEADOR INTELIGENTE ---
        if (settings.tickets_dm_flow_enabled) {
            try {
                // Validações essenciais para o novo fluxo
                if (!settings.tickets_dm_claim_channel_id) {
                    return interaction.editReply('❌ O sistema de Ticket via DM está ativo, mas o canal para "Assumir Atendimentos" não foi configurado no Hub Premium.');
                }
                const ticketCategoryID = settings.tickets_category;

                await interaction.editReply('✅ Sessão de suporte iniciada! Verifique suas mensagens diretas (DM) para continuar.');

                const category = await interaction.guild.channels.fetch(ticketCategoryID);
                const channelName = `dm-ticket-${interaction.user.username.substring(0, 15)}`;

                // 1. Cria o canal âncora oculto
                const anchorChannel = await interaction.guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: category,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: settings.tickets_cargo_suporte, allow: [PermissionsBitField.Flags.ViewChannel] },
                    ],
                });

                // 2. Cria a thread privada para a staff
                const thread = await anchorChannel.threads.create({
                    name: `Atendimento - ${interaction.user.tag}`,
                    autoArchiveDuration: 1440,
                    reason: `Ticket de DM para ${interaction.user.tag}`
                });

                // 3. Salva no banco de dados
                const initialLog = `> Ticket de DM aberto por <@${interaction.user.id}>.\n`;
                const dbResult = await db.query(
                    'INSERT INTO tickets (channel_id, guild_id, user_id, action_log, thread_id, is_dm_ticket) VALUES ($1, $2, $3, $4, $5, true) RETURNING *',
                    [anchorChannel.id, interaction.guild.id, interaction.user.id, initialLog, thread.id]
                );
                const ticketData = dbResult.rows[0];

                // 4. Envia o painel de controle para a staff na thread
                const staffControlPanel = generateDmStaffControlEmbed(ticketData, interaction.user);
                await thread.send({ ...staffControlPanel });

                // 5. Envia o alerta para o canal de "assumir tickets"
                const claimChannel = await interaction.guild.channels.fetch(settings.tickets_dm_claim_channel_id);
                if (claimChannel) {
                    const claimEmbed = new EmbedBuilder()
                        .setColor('Blue')
                        .setTitle('🆕 Novo Atendimento via DM')
                        .setDescription(`O usuário ${interaction.user} (${interaction.user.tag}) precisa de suporte.`)
                        .addFields({ name: 'Ações', value: 'Clique abaixo para assumir o atendimento e ser adicionado ao canal de comunicação.' })
                        .setTimestamp();
                    
                    const claimButtons = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId(`ticket_dm_claim_${anchorChannel.id}`).setLabel('Assumir Atendimento').setStyle(ButtonStyle.Success).setEmoji('🙋‍♂️'),
                        new ButtonBuilder().setURL(thread.url).setLabel('Acompanhar Thread').setStyle(ButtonStyle.Link)
                    );
                    
                    await claimChannel.send({ content: `<@&${settings.tickets_cargo_suporte}>`, embeds: [claimEmbed], components: [claimButtons] });
                }

                // 6. Envia a embed instrucional para a DM do usuário
                const welcomeMessage = generateDmWelcomeEmbed(interaction, ticketData);
                await interaction.user.send(welcomeMessage);

            } catch (error) {
                console.error("Erro ao criar ticket de DM:", error);
                await interaction.followUp({ content: '❌ Ocorreu um erro ao iniciar seu ticket. Verifique se suas DMs estão abertas para o bot e se o servidor está configurado corretamente.', ephemeral: true });
            }
        } else {

            // --- FLUXO ANTIGO (VIA CANAL) ---
            if (settings.tickets_use_departments) {
                const departments = (await db.query('SELECT * FROM ticket_departments WHERE guild_id = $1', [interaction.guild.id])).rows;
                if (departments.length > 0) {
                    const selectMenu = generateDepartmentSelect(departments);
                    return interaction.editReply(selectMenu);
                }
            }

            const category = await interaction.guild.channels.fetch(settings.tickets_category).catch(() => null);
            if (!category) {
                return interaction.editReply('A categoria para criar tickets não foi encontrada. Contate um administrador.');
            }
            
            try {
                const ticketCountResult = await db.query('SELECT ticket_number FROM tickets WHERE guild_id = $1 ORDER BY ticket_number DESC LIMIT 1', [interaction.guild.id]);
                const nextTicketNumber = (ticketCountResult.rows[0]?.ticket_number || 0) + 1;
                const channelName = `ticket-${String(nextTicketNumber).padStart(4, '0')}`;

                const channel = await interaction.guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: category,
                    topic: `Ticket #${nextTicketNumber} aberto por ${interaction.user.tag}. ID: ${interaction.user.id}`,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles] },
                        { id: settings.tickets_cargo_suporte, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.ManageMessages] },
                    ],
                });

                const initialLog = `> Ticket #${nextTicketNumber} aberto por <@${interaction.user.id}>.\n`;
                await db.query('INSERT INTO tickets (channel_id, guild_id, user_id, action_log, is_dm_ticket) VALUES ($1, $2, $3, $4, false)', [channel.id, interaction.guild.id, interaction.user.id, initialLog]);
                
                const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [channel.id])).rows[0];
                const dashboard = generateTicketDashboard(ticketData, interaction.member);
                
                await channel.send({ content: `${interaction.user} <@&${settings.tickets_cargo_suporte}>`, ...dashboard });

                if (settings.tickets_greeting_enabled) {
                    const activeMessages = (await db.query('SELECT message FROM ticket_greeting_messages WHERE guild_id = $1 AND is_active = true ORDER BY id ASC', [interaction.guild.id])).rows;
                    for (const msg of activeMessages) {
                        const formattedMessage = msg.message.replace('{user}', `<@${interaction.user.id}>`).replace('{server}', interaction.guild.name);
                        await channel.send({ content: formattedMessage });
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }

                await interaction.editReply(`✅ Seu ticket foi criado em ${channel}!`);

            } catch (error) {
                console.error("Erro ao criar ticket (padrão):", error);
                await interaction.editReply('Ocorreu um erro ao criar seu ticket. Verifique minhas permissões.');
            }
        }
    }
};