// Crie em: handlers/buttons/tickets_feedback_toggle.js
const db = require('../../database.js');
const generateTicketsPremiumMenu = require('../../ui/ticketsPremiumMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'tickets_feedback_toggle',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        await db.query(`UPDATE guild_settings SET tickets_feedback_enabled = NOT COALESCE(tickets_feedback_enabled, false) WHERE guild_id = $1`, [interaction.guild.id]);
        
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};

        await interaction.editReply({
            components: generateTicketsPremiumMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};