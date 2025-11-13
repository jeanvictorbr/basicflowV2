const db = require('../../database.js');
const generateDevKeysMenu = require('../../ui/devPanel/devKeysMenu.js'); // Reaproveita para voltar ao menu
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'select_dev_key_revoke',
    async execute(interaction) {
        // 1. Captura a chave selecionada
        const keyToRevoke = interaction.values[0];

        // 2. Deleta do Banco
        const result = await db.query('DELETE FROM activation_keys WHERE key = $1 RETURNING *', [keyToRevoke]);
        
        if (result.rowCount > 0) {
            // Sucesso
            const successLayout = {
                type: 17,
                accent_color: 5763719, // Verde
                components: [
                    { type: 10, content: `## ✅ Chave Revogada\nA chave \`${keyToRevoke}\` foi removida permanentemente e não pode mais ser usada.` },
                    { type: 14, divider: true, spacing: 2 },
                    {
                        type: 1,
                        components: [
                            { type: 2, style: 2, label: "Voltar ao Gerenciador", custom_id: "dev_manage_keys" }
                        ]
                    }
                ]
            };

            await interaction.update({
                content: "",
                components: [successLayout],
                flags: V2_FLAG | EPHEMERAL_FLAG
            });
        } else {
            // Erro (Chave não encontrada)
            await interaction.update({
                content: "❌ Erro: A chave não foi encontrada ou já foi deletada.",
                components: [],
                flags: EPHEMERAL_FLAG
            });
        }
    }
};