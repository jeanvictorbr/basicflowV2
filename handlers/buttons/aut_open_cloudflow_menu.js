// handlers/buttons/aut_open_cloudflow_menu.js
const { buildCloudFlowMenu } = require('../../ui/automations/cloudflowMenu');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_open_cloudflow_menu',
    async execute(interaction) {
        
        // Constrói o menu CloudFlow (a UI faz a query, seguindo o padrão V2)
        const menu = await buildCloudFlowMenu(interaction);
        
        // --- CORREÇÃO ---
        // Usar .update() para atualizar a mensagem existente em vez de .reply()
        return await interaction.update({
            ...menu[0],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    },
};