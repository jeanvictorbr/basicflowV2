// File: handlers/buttons/aut_oauth_global_page.js
const manager = require('./aut_oauth_manage_members.js');

module.exports = {
    customId: 'oauth_global_page_',
    async execute(interaction) {
        const page = parseInt(interaction.customId.split('_')[3]); // oauth_global_page_1
        if (!isNaN(page) && manager.loadMembersPage) {
            // Chama a função passando true no final para indicar Modo Global
            await manager.loadMembersPage(interaction, page, true);
        }
    }
};