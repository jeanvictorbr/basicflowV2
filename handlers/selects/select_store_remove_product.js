// Crie em: handlers/selects/select_store_remove_product.js
const db = require('../../database.js');
const generateProductsMenu = require('../../ui/store/productsMenu.js');
const updateStoreVitrine = require('../../utils/updateStoreVitrine.js'); // IMPORTA A FUNÇÃO
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_store_remove_product',
    async execute(interaction) {
        await interaction.deferUpdate();
        const productId = interaction.values[0];

        await db.query('DELETE FROM store_products WHERE id = $1 AND guild_id = $2', [productId, interaction.guild.id]);

        const products = (await db.query('SELECT * FROM store_products WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        await interaction.editReply({
            components: generateProductsMenu(products, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
        await interaction.followUp({ content: '✅ Produto removido com sucesso!', ephemeral: true });

        // CHAMA A FUNÇÃO PARA ATUALIZAR A VITRINE
        await updateStoreVitrine(interaction.client, interaction.guild.id);
    }
};