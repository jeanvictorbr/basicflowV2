// handlers/buttons/tickets_open_premium_menu.js
const db = require('../../database.js');
const generateTicketsPremiumMenu = require('../../ui/ticketsPremiumMenu.js');
const hasFeature = require('../../utils/featureCheck.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'tickets_open_premium_menu',
    async execute(interaction) {
        if (!await hasFeature(interaction.guild.id, 'TICKETS_PREMIUM')) {
            return interaction.reply({ content: 'Esta é uma funcionalidade premium.', ephemeral: true });
        }

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        await interaction.update({
            components: generateTicketsPremiumMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};