// Substitua o conteúdo em: handlers/buttons/dev_key_revoke.js
const db = require('../../database.js');
const generateDevKeyRevokeMenu = require('../../ui/devPanel/devKeyRevokeMenu.js');

module.exports = {
    customId: 'dev_key_revoke',
    async execute(interaction) {
        await interaction.deferUpdate();

        // CORREÇÃO: Ordenando por 'id' que é garantido de existir.
        const keysResult = await db.query('SELECT key, grants_features, uses_left FROM activation_keys WHERE uses_left > 0 ORDER BY id DESC');
        const allKeys = keysResult.rows;

        if (allKeys.length === 0) {
            return interaction.editReply({ content: 'Não há chaves ativas para revogar.', components: [], ephemeral: true });
        }

        const menu = generateDevKeyRevokeMenu(allKeys, 0);

        await interaction.editReply(menu);
    }
};