// handlers/buttons/ticket_remove_user.js
const { UserSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'ticket_remove_user',
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
            return interaction.reply({ content: '⛔ Você não tem permissão para remover membros neste ticket.', ephemeral: true });
        }
        // --------------------------------

        const selectMenu = new UserSelectMenuBuilder().setCustomId('select_ticket_remove_user').setPlaceholder('Selecione um membro para remover');
        const cancelButton = new ButtonBuilder().setCustomId('ticket_cancel_action').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        
        await interaction.reply({ 
            content: 'users Selecione quem você deseja **remover** deste ticket:',
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            ephemeral: true
        });
    }
};