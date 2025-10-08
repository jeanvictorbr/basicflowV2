// handlers/buttons/dev_key_history_delete_confirm.js
const db = require('../../database.js');
const generateDevKeyHistoryMenu = require('../../ui/devPanel/devKeyHistoryMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_key_history_delete_confirm_',
    async execute(interaction) {
        await interaction.deferUpdate();

        const historyEntryId = interaction.customId.split('_')[5];

        await db.query('DELETE FROM key_activation_history WHERE id = $1', [historyEntryId]);

        const updatedHistory = (await db.query('SELECT * FROM key_activation_history ORDER BY activated_at DESC')).rows;

        await interaction.editReply({
            components: generateDevKeyHistoryMenu(updatedHistory, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });

        await interaction.followUp({ content: `✅ Registro de histórico #${historyEntryId} apagado com sucesso.`, ephemeral: true });
    }
};