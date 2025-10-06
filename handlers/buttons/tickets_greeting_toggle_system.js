// Crie ou substitua em: handlers/buttons/tickets_greeting_toggle_system.js
const db = require('../../database.js');
const generateGreetingMenu = require('../../ui/ticketsGreetingMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'tickets_greeting_toggle_system',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        await db.query(`UPDATE guild_settings SET tickets_greeting_enabled = NOT COALESCE(tickets_greeting_enabled, false) WHERE guild_id = $1`, [interaction.guild.id]);
        
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const messages = (await db.query('SELECT * FROM ticket_greeting_messages WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;

        await interaction.editReply({
            components: generateGreetingMenu(settings, messages),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};