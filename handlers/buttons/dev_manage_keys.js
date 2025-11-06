// handlers/buttons/dev_manage_keys.js
const db = require('../../database.js');
const generateDevKeysMenu = require('../../ui/devPanel/devKeysMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_manage_keys',
    async execute(interaction) {
        await interaction.deferUpdate();
        // CORREÇÃO: Busca apenas chaves com usos restantes
        const keys = (await db.query('SELECT * FROM activation_keys WHERE uses_left > 0 ORDER BY key ASC')).rows;

        await interaction.editReply({
            components: generateDevKeysMenu(keys, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};