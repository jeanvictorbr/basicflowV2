// Crie em: handlers/buttons/store_products_page.js
const db = require('../../database.js');
const generateProductsMenu = require('../../ui/store/productsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_products_page_', // Handler dinâmico
    async execute(interaction) {
        const page = parseInt(interaction.customId.split('_')[3], 10);
        if (isNaN(page)) return;

        await interaction.deferUpdate();
        
        const products = (await db.query('SELECT * FROM store_products WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        
        await interaction.editReply({
            components: generateProductsMenu(products, page),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};