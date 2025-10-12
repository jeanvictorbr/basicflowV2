// handlers/selects/select_welcome_autorole.js
const db = require('../../database.js');
const generateWelcomeMenu = require('../../ui/welcomeMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_welcome_autorole',
    async execute(interaction) {
        await interaction.deferUpdate();
        const roleId = interaction.values[0];
        await db.query(`UPDATE guild_settings SET autorole_id = $1 WHERE guild_id = $2`, [roleId, interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const menu = await generateWelcomeMenu(interaction, settings);
        await interaction.editReply({ components: menu, flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};