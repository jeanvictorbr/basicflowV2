const db = require('../../database.js');
const generatePanelBuilder = require('../../ui/automations/rolePanelBuilder.js');

module.exports = {
    customId: 'aut_btn_sel_',
    async execute(interaction) {
        const panelId = interaction.values[0];
        
        // Busca o painel atualizado
        const res = await db.query('SELECT * FROM button_role_panels WHERE panel_id = $1', [panelId]);
        
        if (res.rows.length === 0) {
            return interaction.reply({ content: '❌ Painel não encontrado.', ephemeral: true });
        }

        const ui = generatePanelBuilder(res.rows[0]);
        
        // Atualiza a mensagem para o modo de edição
        await interaction.update({ 
            content: `🔧 **Editando Painel #${panelId}**`,
            embeds: ui.embeds,
            components: ui.components
        });
    }
};