const db = require('../../database.js');
const generateEditProductSelectMenu = require('../../ui/store/editProductSelectMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;
module.exports = {
    customId: 'modal_store_edit_search',
    async execute(interaction) {
        await interaction.deferUpdate();
        const query = interaction.fields.getTextInputValue('q');
        const products = (await db.query('SELECT id, name, price FROM store_products WHERE guild_id = $1 AND name ILIKE $2 LIMIT 25', [interaction.guild.id, `%${query}%`])).rows;
        await interaction.editReply({ components: generateEditProductSelectMenu(products, 0, 1, true, query), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};