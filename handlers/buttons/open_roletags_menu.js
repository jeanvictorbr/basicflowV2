// handlers/buttons/open_roletags_menu.js
const db = require('../../database.js');
const generateRoleTagsMenu = require('../../ui/roleTagsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'open_roletags_menu',
    async execute(interaction) {
        await interaction.deferUpdate();
        const tags = (await db.query('SELECT * FROM role_tags WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        
        await interaction.editReply({
            components: generateRoleTagsMenu(tags),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};