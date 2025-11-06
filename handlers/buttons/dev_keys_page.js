// handlers/buttons/dev_keys_page.js
const db = require('../../database.js');
const generateDevKeysMenu = require('../../ui/devPanel/devKeysMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_keys_page_',
    async execute(interaction) {
        const page = parseInt(interaction.customId.split('_')[3], 10);
        if (isNaN(page)) return;

        await interaction.deferUpdate();
        const keys = (await db.query('SELECT * FROM activation_keys ORDER BY key ASC')).rows;
        
        await interaction.editReply({
            components: generateDevKeysMenu(keys, page),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};