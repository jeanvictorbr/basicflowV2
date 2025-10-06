// Crie em: handlers/buttons/tickets_greeting_toggle_message.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'tickets_greeting_toggle_message',
    async execute(interaction) {
        const messages = (await db.query('SELECT id, message, is_active FROM ticket_greeting_messages WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        
        const options = messages.map(m => ({
            label: `[ID: ${m.id}] ${m.is_active ? 'Ativa' : 'Inativa'}`,
            description: m.message.substring(0, 100),
            value: String(m.id),
            emoji: m.is_active ? '🟢' : '🔴'
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_ticket_greeting_toggle')
            .setPlaceholder('Selecione uma mensagem para ativar ou desativar')
            .addOptions(options);

        const cancelButton = new ButtonBuilder().setCustomId('tickets_config_greeting').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        
        await interaction.update({
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};