// handlers/buttons/dev_keys_page.js
const db = require('../../database.js');
const generateDevKeysMenu = require('../../ui/devPanel/devKeysMenu.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    // CustomID dinâmico: dev_keys_page_NUMERO
    customId: 'dev_keys_page_', 
    async execute(interaction) {
        await interaction.deferUpdate();

        // Extrai a página do ID
        const page = parseInt(interaction.customId.split('_').pop(), 10);
        const itemsPerPage = 5;
        const offset = page * itemsPerPage;

        // Mesma lógica de busca
        const keysResult = await db.query(
            'SELECT * FROM activation_keys WHERE uses_left > 0 ORDER BY created_at DESC LIMIT $1 OFFSET $2', 
            [itemsPerPage, offset]
        );
        
        const totalKeysResult = await db.query('SELECT COUNT(*) FROM activation_keys WHERE uses_left > 0');
        const totalKeys = parseInt(totalKeysResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalKeys / itemsPerPage) || 1;

        const menuV2 = generateDevKeysMenu(keysResult.rows, page, totalKeys, totalPages);

        await interaction.editReply({
            components: [menuV2],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};