// handlers/buttons/aut_cf_manage_backups.js
const { buildCloudFlowBackupsMenu } = require('../../ui/automations/cloudflowBackupsMenu');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_cf_manage_backups',
    async execute(interaction) {
        
        // Constrói o menu de Backups
        const menu = await buildCloudFlowBackupsMenu(interaction);
        
        // Atualiza a mensagem
        return await interaction.update({
            ...menu[0],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    },
};