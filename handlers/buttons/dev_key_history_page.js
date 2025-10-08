// Crie em: handlers/buttons/dev_key_history_page.js
const db = require('../../database.js');
const generateDevKeyHistoryMenu = require('../../ui/devPanel/devKeyHistoryMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_key_history_page_',
    async execute(interaction) {
        const page = parseInt(interaction.customId.split('_')[4], 10);
        if (isNaN(page)) return;

        await interaction.deferUpdate();
        const history = (await db.query('SELECT * FROM key_activation_history ORDER BY activated_at DESC')).rows;
        
        await interaction.editReply({
            components: generateDevKeyHistoryMenu(history, page),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};