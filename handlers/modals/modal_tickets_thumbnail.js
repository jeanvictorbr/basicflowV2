// Crie em: handlers/modals/modal_tickets_thumbnail.js
const db = require('../../database.js');
const generateTicketsMenu = require('../../ui/ticketsMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_tickets_thumbnail',
    async execute(interaction) {
        const imageUrl = interaction.fields.getTextInputValue('input_thumbnail');
        await db.query(`UPDATE guild_settings SET tickets_thumbnail_url = $1 WHERE guild_id = $2`, [imageUrl, interaction.guild.id]);
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        await interaction.update({ components: generateTicketsMenu(settingsResult.rows[0]), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};