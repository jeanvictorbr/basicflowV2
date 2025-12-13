    const db = require('../../database.js');
const generatePanelBuilder = require('../../ui/automations/rolePanelBuilder.js');

module.exports = {
    customId: 'modal_pnl_add_role_',
    async execute(interaction) {
        const panelId = interaction.customId.split('_')[4];
        const roleId = interaction.fields.getTextInputValue('in_role').replace(/\D/g, '');
        const label = interaction.fields.getTextInputValue('in_label');
        const emoji = interaction.fields.getTextInputValue('in_emoji');

        // Validação básica de cargo
        const role = await interaction.guild.roles.fetch(roleId).catch(() => null);
        if (!role) return interaction.reply({ content: '❌ Cargo inválido.', ephemeral: true });

        // Atualiza DB
        const res = await db.query('SELECT roles_data FROM button_role_panels WHERE panel_id = $1', [panelId]);
        let current = res.rows[0]?.roles_data || [];
        if (!Array.isArray(current)) current = [];

        current.push({ role_id: roleId, label: label, emoji: emoji || null });

        await db.query('UPDATE button_role_panels SET roles_data = $1 WHERE panel_id = $2', [JSON.stringify(current), panelId]);

        // Refresh UI
        const updatedPanel = (await db.query('SELECT * FROM button_role_panels WHERE panel_id = $1', [panelId])).rows[0];
        const ui = generatePanelBuilder(updatedPanel);
        
        await interaction.update({ embeds: ui.embeds, components: ui.components });
    }
};