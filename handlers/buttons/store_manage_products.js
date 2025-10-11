// Crie em: handlers/buttons/store_manage_products.js
const db = require('../../database.js');
const generateProductsMenu = require('../../ui/store/productsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_manage_products',
    async execute(interaction) {
        await interaction.deferUpdate();
        const products = (await db.query('SELECT * FROM store_products WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        
        await interaction.editReply({
            components: generateProductsMenu(products, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};