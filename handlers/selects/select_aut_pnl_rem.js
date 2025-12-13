const db = require('../../database.js');
const generatePanelBuilder = require('../../ui/automations/rolePanelBuilder.js');

module.exports = {
    customId: 'select_aut_pnl_rem_',
    async execute(interaction) {
        const panelId = interaction.customId.split('_')[4];
        const indexToRemove = parseInt(interaction.values[0]);

        const res = await db.query('SELECT roles_data FROM button_role_panels WHERE panel_id = $1', [panelId]);
        let current = res.rows[0]?.roles_data || [];

        // Remove pelo índice
        current.splice(indexToRemove, 1);

        await db.query('UPDATE button_role_panels SET roles_data = $1 WHERE panel_id = $2', [JSON.stringify(current), panelId]);

        // Atualiza o painel principal
        const panel = (await db.query('SELECT * FROM button_role_panels WHERE panel_id = $1', [panelId])).rows[0];
        const ui = generatePanelBuilder(panel);

        await interaction.update({ 
            content: '✅ Item removido com sucesso! Aqui está o painel atualizado:', 
            embeds: ui.embeds, 
            components: ui.components 
        });
    }
};