// Substitua o conteúdo em: handlers/buttons/dev_key_revoke_page_.js
const db = require('../../database.js');
const generateDevKeyRevokeMenu = require('../../ui/devPanel/devKeyRevokeMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_key_revoke_page_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const page = parseInt(interaction.customId.split('_')[4], 10);

        const keysResult = await db.query('SELECT key, grants_features, uses_left FROM activation_keys WHERE uses_left > 0 ORDER BY id DESC');
        const allKeys = keysResult.rows;

        const menuComponents = generateDevKeyRevokeMenu(allKeys, page);

        // CORREÇÃO: Usando a estrutura de resposta correta com flags explícitas
        await interaction.editReply({
            content: '',
            components: menuComponents,
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};