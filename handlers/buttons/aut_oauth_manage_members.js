// File: handlers/buttons/aut_oauth_manage_members.js
// DESATIVADO TEMPORARIAMENTE PARA EVITAR ERROS DE API

module.exports = {
    customId: 'aut_oauth_manage_members',
    async execute(interaction) {
        // Apenas avisa que está desativado
        await interaction.reply({ 
            content: '⚠️ **Função Desativada Temporariamente**\nEste painel está em manutenção para estabilização do sistema.', 
            ephemeral: true 
        });
    }
};

// Mantém a exportação da função para não quebrar outros arquivos que a importam
// Mas a função agora não faz nada.
async function loadMembersPage(interaction, page, isGlobal = false) {
    if (interaction.isRepliable() && !interaction.replied) {
         await interaction.reply({ content: '⚠️ Manutenção.', ephemeral: true }).catch(() => {});
    }
    return; 
}

module.exports.loadMembersPage = loadMembersPage;