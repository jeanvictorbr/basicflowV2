// Crie em: handlers/buttons/tickets_department_remove.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'tickets_department_remove',
    async execute(interaction) {
        const departments = (await db.query('SELECT id, name, emoji FROM ticket_departments WHERE guild_id = $1', [interaction.guild.id])).rows;
        
        const options = departments.map(d => ({
            label: d.name,
            value: String(d.id),
            emoji: d.emoji || undefined
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_ticket_department_remove')
            .setPlaceholder('Selecione um departamento para remover')
            .addOptions(options);

        const cancelButton = new ButtonBuilder().setCustomId('tickets_config_departments').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        
        await interaction.update({
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};