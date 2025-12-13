const db = require('../../database.js');
const generatePanelBuilder = require('../../ui/automations/rolePanelBuilder.js');

module.exports = {
    customId: 'modal_pnl_img_',
    async execute(interaction) {
        const panelId = interaction.customId.split('_')[3];
        const newImg = interaction.fields.getTextInputValue('input_img');

        await db.query('UPDATE button_role_panels SET image_url = $1 WHERE panel_id = $2', [newImg || null, panelId]);
        
        const panel = (await db.query('SELECT * FROM button_role_panels WHERE panel_id = $1', [panelId])).rows[0];
        const ui = generatePanelBuilder(panel);
        await interaction.update({ embeds: ui.embeds, components: ui.components });
    }
};