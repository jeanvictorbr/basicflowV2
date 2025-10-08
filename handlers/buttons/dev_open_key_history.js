// Crie em: handlers/buttons/dev_open_key_history.js
const db = require('../../database.js');
const generateDevKeyHistoryMenu = require('../../ui/devPanel/devKeyHistoryMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_open_key_history',
    async execute(interaction) {
        await interaction.deferUpdate();
        const history = (await db.query('SELECT * FROM key_activation_history ORDER BY activated_at DESC')).rows;

        await interaction.editReply({
            components: generateDevKeyHistoryMenu(history, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};