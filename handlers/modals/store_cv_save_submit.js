const db = require('../../database');
const categoryConfigMenu = require('../../ui/store/categoryConfigMenu');
const updateStoreVitrine = require('../../utils/updateStoreVitrine');

module.exports = {
    customId: 'store_cv_save_',
    execute: async (interaction) => {
        const client = interaction.client;
        const parts = interaction.customId.split('_');
        const categoryId = parts.pop();
        const action = parts[3]; 

        let column, value;

        switch(action) {
            case 'title':
                column = 'vitrine_title';
                value = interaction.fields.getTextInputValue('title_input');
                break;
            case 'desc':
                column = 'vitrine_desc';
                value = interaction.fields.getTextInputValue('desc_input');
                break;
            case 'image':
                column = 'vitrine_image';
                value = interaction.fields.getTextInputValue('image_input');
                break;
            case 'color':
                column = 'vitrine_color';
                value = interaction.fields.getTextInputValue('color_input');
                if (!/^#[0-9A-F]{6}$/i.test(value)) value = '#2b2d31';
                break;
        }

        const query = `UPDATE store_categories SET ${column} = $1 WHERE id = $2 RETURNING *`;
        const result = await db.query(query, [value, categoryId]);
        const updatedData = result.rows[0];

        // Atualiza vitrine em tempo real se já existir
        if (updatedData.vitrine_message_id) {
            try {
                await updateStoreVitrine(client, interaction.guild.id, categoryId);
            } catch (e) { console.error(e); }
        }

        const menu = categoryConfigMenu(updatedData);
        await interaction.update(menu);
    }
};