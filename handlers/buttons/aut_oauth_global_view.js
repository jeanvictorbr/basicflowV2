// File: handlers/buttons/aut_oauth_global_view.js
const manager = require('./aut_oauth_manage_members.js');

module.exports = {
    customId: 'aut_oauth_global_view',
    async execute(interaction) {
        // Chama a função principal ativando o modo GLOBAL (true)
        if (manager.loadMembersPage) {
            await manager.loadMembersPage(interaction, 1, true);
        } else {
            await interaction.reply({ content: "Erro interno: Função de carga não encontrada.", ephemeral: true });
        }
    }
};