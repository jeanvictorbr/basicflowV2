// Crie em: handlers/buttons/store_config_main.js
const db = require('../../database.js');
const generateConfigMenu = require('../../ui/store/configMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_config_main',
    async execute(interaction) {
        await interaction.deferUpdate();
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        await interaction.editReply({
            components: generateConfigMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};