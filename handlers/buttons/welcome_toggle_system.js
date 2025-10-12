// handlers/buttons/welcome_toggle_system.js
const db = require('../../database.js');
const generateWelcomeMenu = require('../../ui/welcomeMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'welcome_toggle_system',
    async execute(interaction) {
        await interaction.deferUpdate();
        await db.query(`UPDATE guild_settings SET welcome_enabled = NOT COALESCE(welcome_enabled, false) WHERE guild_id = $1`, [interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const menu = await generateWelcomeMenu(interaction, settings);
        
        // PADRÃO CORRETO: O objeto 'menu' é colocado dentro de um array.
        await interaction.editReply({ components: [menu], flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};