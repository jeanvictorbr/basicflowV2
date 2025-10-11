// Crie em: handlers/buttons/store_customize_vitrine.js
const db = require('../../database.js');
const generateCustomizeMenu = require('../../ui/store/customizeMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_customize_vitrine',
    async execute(interaction) {
        await interaction.deferUpdate();
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        await interaction.editReply({
            components: generateCustomizeMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};