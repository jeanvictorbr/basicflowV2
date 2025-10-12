// Substitua o conteúdo em: handlers/buttons/dev_key_revoke.js
const db = require('../../database.js');
const generateDevKeyRevokeMenu = require('../../ui/devPanel/devKeyRevokeMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_key_revoke',
    async execute(interaction) {
        await interaction.deferUpdate();

        const keysResult = await db.query('SELECT key, grants_features, uses_left FROM activation_keys WHERE uses_left > 0 ORDER BY id DESC');
        const allKeys = keysResult.rows;

        if (allKeys.length === 0) {
            await interaction.editReply({
                content: '✅ Não há chaves ativas para revogar.',
                components: [{
                    type: 1,
                    components: [
                        { type: 2, style: 2, label: 'Voltar', emoji: { name: '↩️' }, custom_id: 'dev_manage_keys' }
                    ]
                }],
                flags: V2_FLAG | EPHEMERAL_FLAG,
            });
            return;
        }

        const menuComponents = generateDevKeyRevokeMenu(allKeys, 0);

        // CORREÇÃO: Usando a estrutura de resposta correta com flags explícitas
        await interaction.editReply({
            content: '', // O conteúdo agora está dentro do componente V2
            components: menuComponents,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};