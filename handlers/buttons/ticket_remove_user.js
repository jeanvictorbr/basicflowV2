// handlers/buttons/ticket_remove_user.js
const { UserSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'ticket_remove_user',
    async execute(interaction) {
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        if (!interaction.member.roles.cache.has(settings.tickets_cargo_suporte)) {
            return interaction.reply({ content: '❌ Você não tem permissão para remover membros de um ticket.', ephemeral: true });
        }

        const selectMenu = new UserSelectMenuBuilder().setCustomId('select_ticket_remove_user').setPlaceholder('Selecione um membro para remover');
        const cancelButton = new ButtonBuilder().setCustomId('ticket_cancel_action').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        
        await interaction.update({ embeds: [], components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)] });
    }
};