// Crie em: handlers/buttons/store_config_advanced.js
const db = require('../../database.js');
const generateConfigAdvancedMenu = require('../../ui/store/configAdvancedMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_config_advanced',
    async execute(interaction) {
        await interaction.deferUpdate();
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        const menu = await generateConfigAdvancedMenu(interaction, settings);

        await interaction.editReply({
            components: menu,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};