// handlers/buttons/aut_mass_roles_menu.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');
const buildMassRolesMenu = require('../../ui/automations/massRolesMenu');

module.exports = {
    customId: 'aut_mass_roles_menu',
    async execute(interaction) {
        // Apenas exibe o menu
        const menu = await buildMassRolesMenu();
        
        // Responde à interação com o menu
        return interaction.update(menu);
    }
};