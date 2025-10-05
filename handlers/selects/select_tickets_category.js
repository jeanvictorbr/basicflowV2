// Crie em: handlers/selects/select_tickets_category.js
const db = require('../../database.js');
const generateTicketsMenu = require('../../ui/ticketsMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_tickets_category',
    async execute(interaction) {
        const categoryId = interaction.values[0];
        await db.query(`UPDATE guild_settings SET tickets_category = $1 WHERE guild_id = $2`, [categoryId, interaction.guild.id]);
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        await interaction.update({ components: generateTicketsMenu(settingsResult.rows[0]), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};