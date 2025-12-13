const db = require('../../database.js');
const generatePanelBuilder = require('../../ui/automations/rolePanelBuilder.js');

module.exports = {
    customId: 'modal_pnl_title_',
    async execute(interaction) {
        const panelId = interaction.customId.split('_')[3];
        const newTitle = interaction.fields.getTextInputValue('input_title');

        await db.query('UPDATE button_role_panels SET title = $1 WHERE panel_id = $2', [newTitle, panelId]);
        
        const panel = (await db.query('SELECT * FROM button_role_panels WHERE panel_id = $1', [panelId])).rows[0];
        const ui = generatePanelBuilder(panel);
        
        await interaction.update({ embeds: ui.embeds, components: ui.components });
    }
};