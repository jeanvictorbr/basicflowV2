const db = require('../../database.js');
const generatePanelBuilder = require('../../ui/automations/rolePanelBuilder.js');

module.exports = {
    customId: 'modal_pnl_role_details_',
    async execute(interaction) {
        // ID vem como: modal_pnl_role_details_PANELID_ROLEID
        const parts = interaction.customId.split('_');
        const panelId = parts[4];
        const roleId = parts[5];

        const label = interaction.fields.getTextInputValue('in_label');
        const emoji = interaction.fields.getTextInputValue('in_emoji');

        // Salva no banco
        const res = await db.query('SELECT roles_data FROM button_role_panels WHERE panel_id = $1', [panelId]);
        let current = res.rows[0]?.roles_data || [];
        if (!Array.isArray(current)) current = [];

        // Adiciona
        current.push({ role_id: roleId, label: label, emoji: emoji || null });

        await db.query('UPDATE button_role_panels SET roles_data = $1 WHERE panel_id = $2', [JSON.stringify(current), panelId]);

        // Feedback
        await interaction.deferUpdate(); // Fecha o modal silenciosamente
        
        // Atualiza a mensagem ORIGINAL do Painel Builder (se possível) ou manda nova
        // Como o modal está "por cima" da mensagem efêmera do select, precisamos editar a mensagem raiz do builder.
        // O discord.js não permite editar interaction antiga facilmente via modal novo sem webhook.
        // WORKAROUND: Mandamos uma confirmação e pedimos para clicar em "Atualizar" ou enviamos um novo builder.
        
        const updatedPanel = (await db.query('SELECT * FROM button_role_panels WHERE panel_id = $1', [panelId])).rows[0];
        const ui = generatePanelBuilder(updatedPanel);

        // Tenta editar a mensagem original (pode falhar se for muito antiga), então mandamos um novo painel limpo
        await interaction.editReply({ 
            content: `✅ Cargo <@&${roleId}> adicionado!`, 
            components: [], 
            embeds: [] 
        });
        
        // Manda o painel atualizado abaixo
        await interaction.followUp({ 
            content: `🔧 **Painel Atualizado**`,
            embeds: ui.embeds, 
            components: ui.components, 
            ephemeral: true 
        });
    }
};