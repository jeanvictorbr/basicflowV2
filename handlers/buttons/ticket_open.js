// handlers/buttons/ticket_open.js
const { ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const generateTicketDashboard = require('../../ui/ticketDashboard.js');

module.exports = {
    customId: 'ticket_open',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        if (!settings?.tickets_category || !settings?.tickets_cargo_suporte) {
            return interaction.editReply('O sistema de tickets não está configurado. Contate um administrador.');
        }

        const category = await interaction.guild.channels.fetch(settings.tickets_category).catch(() => null);
        if (!category) {
            return interaction.editReply('A categoria para criar tickets não foi encontrada. Contate um administrador.');
        }
        
        // Verifica se já existe um ticket para o usuário
        const existingTicket = (await db.query('SELECT * FROM tickets WHERE user_id = $1 AND guild_id = $2 AND status != $3', [interaction.user.id, interaction.guild.id, 'closed'])).rows[0];
        if(existingTicket) {
            const channel = interaction.guild.channels.cache.get(existingTicket.channel_id);
            return interaction.editReply(`Você já possui um ticket aberto em ${channel || 'um canal que não pude encontrar'}.`);
        }

        try {
            const ticketCountResult = await db.query('SELECT ticket_number FROM tickets WHERE guild_id = $1 ORDER BY ticket_number DESC LIMIT 1', [interaction.guild.id]);
            const nextTicketNumber = (ticketCountResult.rows[0]?.ticket_number || 0) + 1;
            const channelName = `ticket-${String(nextTicketNumber).padStart(4, '0')}`;

            const channel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: category,
                topic: `Ticket #${nextTicketNumber} aberto por ${interaction.user.tag}. ID do usuário: ${interaction.user.id}`,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles] },
                    { id: settings.tickets_cargo_suporte, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.ManageMessages] },
                ],
            });

            const initialLog = `> Ticket #${nextTicketNumber} aberto por ${interaction.user}.\n`;
            await db.query('INSERT INTO tickets (channel_id, guild_id, user_id, action_log) VALUES ($1, $2, $3, $4)', 
                [channel.id, interaction.guild.id, interaction.user.id, initialLog]
            );
            
            const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [channel.id])).rows[0];
            const dashboard = generateTicketDashboard(ticketData, interaction.member); 
            
            // Envia o dashboard principal para os admins
            await channel.send({ content: `${interaction.user} <@&${settings.tickets_cargo_suporte}>`, ...dashboard });

            // Envia o painel de controle SÓ PARA O USUÁRIO
            const userControlPanel = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_close_by_user').setLabel('Finalizar Ticket').setStyle(ButtonStyle.Danger).setEmoji('✖️')
            );
            await channel.send({ 
                content: `Olá ${interaction.user}, este é seu painel de controle. Use o botão abaixo se o seu problema foi resolvido.`, 
                components: [userControlPanel],
                ephemeral: true 
            });

            await interaction.editReply(`✅ Seu ticket foi criado em ${channel}!`);
        } catch (error) {
            console.error("Erro ao criar ticket:", error);
            await interaction.editReply('Ocorreu um erro ao criar seu ticket. Verifique minhas permissões para criar canais e gerenciar permissões.');
        }
    }
};