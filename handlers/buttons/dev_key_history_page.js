const db = require('../../database.js');
const generateDevKeyHistoryMenu = require('../../ui/devPanel/devKeyHistoryMenu.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'dev_key_history_page_', 
    async execute(interaction) {
        await interaction.deferUpdate();

        const page = parseInt(interaction.customId.split('_').pop(), 10);
        const itemsPerPage = 5;
        const offset = page * itemsPerPage;

        const historyResult = await db.query(
            'SELECT * FROM activation_key_history ORDER BY activated_at DESC LIMIT $1 OFFSET $2', 
            [itemsPerPage, offset]
        );
        
        const totalResult = await db.query('SELECT COUNT(*) FROM activation_key_history');
        const totalItems = parseInt(totalResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

        const menuV2 = generateDevKeyHistoryMenu(historyResult.rows, page, totalItems, totalPages);

        await interaction.editReply({
            components: [menuV2],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};