// handlers/buttons/ticket_open.js
const { ChannelType, PermissionsBitField } = require('discord.js');
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
        
        const channelName = `ticket-${interaction.user.username.substring(0, 20)}`;
        const existingChannel = interaction.guild.channels.cache.find(c => c.name === channelName && c.parentId === category.id);
        if(existingChannel) {
            return interaction.editReply(`Você já possui um ticket aberto em ${existingChannel}.`);
        }

        try {
            const channel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: category,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
                    { id: settings.tickets_cargo_suporte, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
                ],
            });

            await db.query('INSERT INTO tickets (channel_id, guild_id, user_id) VALUES ($1, $2, $3)', [channel.id, interaction.guild.id, interaction.user.id]);
            
            const dashboard = generateTicketDashboard();
            await channel.send({ content: `${interaction.user} <@&${settings.tickets_cargo_suporte}>`, ...dashboard });

            await interaction.editReply(`✅ Seu ticket foi criado em ${channel}!`);
        } catch (error) {
            console.error("Erro ao criar ticket:", error);
            await interaction.editReply('Ocorreu um erro ao criar seu ticket. Verifique minhas permissões.');
        }
    }
};