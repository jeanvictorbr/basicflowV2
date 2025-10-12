// Crie em: handlers/buttons/dev_key_revoke_page_.js
const db = require('../../database.js');
const generateDevKeyRevokeMenu = require('../../ui/devPanel/devKeyRevokeMenu.js');

module.exports = {
    customId: 'dev_key_revoke_page_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const page = parseInt(interaction.customId.split('_')[4], 10);

        const keysResult = await db.query('SELECT key, grants_features, uses_left FROM activation_keys WHERE uses_left > 0 ORDER BY created_at DESC');
        const allKeys = keysResult.rows;

        const menu = generateDevKeyRevokeMenu(allKeys, page);

        await interaction.editReply(menu);
    }
};