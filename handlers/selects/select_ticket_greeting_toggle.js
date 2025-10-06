// Crie em: handlers/selects/select_ticket_greeting_toggle.js
const db = require('../../database.js');
const generateGreetingMenu = require('../../ui/ticketsGreetingMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_ticket_greeting_toggle',
    async execute(interaction) {
        await interaction.deferUpdate();
        const messageId = interaction.values[0];
        
        // Inverte o status da mensagem selecionada
        await db.query('UPDATE ticket_greeting_messages SET is_active = NOT is_active WHERE id = $1 AND guild_id = $2', [messageId, interaction.guild.id]);

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const messages = (await db.query('SELECT * FROM ticket_greeting_messages WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;

        await interaction.editReply({
            components: generateGreetingMenu(settings, messages),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};