// Substitua em: handlers/buttons/ticket_add_user.js
const { UserSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'ticket_add_user',
    async execute(interaction) {
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        if (!interaction.member.roles.cache.has(settings.tickets_cargo_suporte)) {
            return interaction.reply({ content: 'Você não tem permissão para adicionar membros a um ticket.', ephemeral: true });
        }// O dashboard do ticket agora é um embed normal, não precisa mais das flags V2 para ser modificado
        await interaction.update({ embeds: [], components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)] });
    }
};