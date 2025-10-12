// Crie em: handlers/buttons/dev_open_bulk_keys.js
const generateDevBulkKeysMenu = require('../../ui/devPanel/devBulkKeysMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_open_bulk_keys',
    async execute(interaction) {
        await interaction.update({
            components: generateDevBulkKeysMenu(),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};