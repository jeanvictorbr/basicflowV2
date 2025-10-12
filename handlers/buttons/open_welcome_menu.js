// handlers/buttons/open_welcome_menu.js
const db = require('../../database.js');
const generateWelcomeMenu = require('../../ui/welcomeMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'open_welcome_menu',
    async execute(interaction) {
        await interaction.deferUpdate();
        await db.query(`INSERT INTO guild_settings (guild_id) VALUES ($1) ON CONFLICT (guild_id) DO NOTHING`, [interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        const menu = await generateWelcomeMenu(interaction, settings);

        // PADRÃO CORRETO: O objeto 'menu' é colocado dentro de um array.
        await interaction.editReply({
            components: [menu],
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};