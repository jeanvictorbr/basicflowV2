// Crie em: handlers/buttons/tickets_autoclose_toggle_dm.js
const db = require('../../database.js');
const generateAutoCloseMenu = require('../../ui/ticketsAutoCloseMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'tickets_autoclose_toggle_dm',
    async execute(interaction) {
        await interaction.deferUpdate();
        await db.query(`UPDATE guild_settings SET tickets_autoclose_dm_user = NOT COALESCE(tickets_autoclose_dm_user, true) WHERE guild_id = $1`, [interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        await interaction.editReply({
            components: generateAutoCloseMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};