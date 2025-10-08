// handlers/selects/select_dev_key_revoke.js
const db = require('../../database.js');

module.exports = {
    customId: 'select_dev_key_revoke',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const key = interaction.values[0];

        await db.query('DELETE FROM activation_keys WHERE key = $1', [key]);

        await interaction.editReply({ content: `✅ Chave \`${key}\` revogada com sucesso! O painel será atualizado.` });

        // Chama o handler do menu principal para recarregar a lista
        const manageKeysHandler = require('../buttons/dev_manage_keys.js');
        await manageKeysHandler.execute(interaction);
    }
};