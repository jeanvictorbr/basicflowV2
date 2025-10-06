// Crie em: handlers/buttons/tickets_greeting_remove.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'tickets_greeting_remove',
    async execute(interaction) {
        const messages = (await db.query('SELECT id, message FROM ticket_greeting_messages WHERE guild_id = $1', [interaction.guild.id])).rows;
        
        const options = messages.map(m => ({
            label: `Mensagem #${m.id}`,
            description: m.message.substring(0, 100),
            value: String(m.id)
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_ticket_greeting_remove')
            .setPlaceholder('Selecione uma mensagem para remover')
            .addOptions(options);

        const cancelButton = new ButtonBuilder().setCustomId('tickets_config_greeting').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        
        await interaction.update({
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};