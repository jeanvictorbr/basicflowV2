// handlers/buttons/open_tickets_menu.js
const db = require('../../database.js');
const generateTicketsMenu = require('../../ui/ticketsMenu.js');
const isPremiumActive = require('../../utils/premiumCheck.js'); // Importa a verificação
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'open_tickets_menu',
    async execute(interaction) {
        await db.query(`INSERT INTO guild_settings (guild_id) VALUES ($1) ON CONFLICT (guild_id) DO NOTHING`, [interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const isPremium = await isPremiumActive(interaction.guild.id); // Verifica o status

        await interaction.update({
            components: generateTicketsMenu(settings, isPremium), // Passa o status para a UI
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};