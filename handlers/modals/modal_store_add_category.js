// Crie em: handlers/modals/modal_store_add_category.js
const db = require('../../database.js');
const generateCategoriesMenu = require('../../ui/store/categoriesMenu.js');
const updateStoreVitrine = require('../../utils/updateStoreVitrine.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_store_add_category',
    async execute(interaction) {
        await interaction.deferUpdate();
        const name = interaction.fields.getTextInputValue('input_name');
        const description = interaction.fields.getTextInputValue('input_desc') || null;
        await db.query('INSERT INTO store_categories (guild_id, name, description) VALUES ($1, $2, $3) ON CONFLICT (guild_id, name) DO NOTHING', [interaction.guild.id, name, description]);
        const categories = (await db.query('SELECT * FROM store_categories WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;
        await interaction.editReply({
            components: generateCategoriesMenu(categories, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
        
        // Atualiza a vitrine principal
        await updateStoreVitrine(interaction.client, interaction.guild.id);
    }
};