// Importa o arquivo onde a função de carregar página está
const manageMembers = require('./aut_oauth_manage_members.js');

module.exports = {
    // O SEGREDO: Prefixo correto
    customId: 'oauth_page_',
    
    async execute(interaction) {
        const parts = interaction.customId.split('_');
        const page = parseInt(parts[2]);
        
        if (isNaN(page)) {
            // É o botão do meio (contador), não faz nada
            return interaction.deferUpdate();
        }
        
        // Verifica se a função foi exportada corretamente no outro arquivo
        if (manageMembers && manageMembers.loadMembersPage) {
            await manageMembers.loadMembersPage(interaction, page);
        } else {
            await interaction.reply({ 
                content: "❌ Erro interno: A função de paginação não foi encontrada. Verifique se `loadMembersPage` está exportada em `aut_oauth_manage_members.js`.", 
                ephemeral: true 
            });
        }
    }
};