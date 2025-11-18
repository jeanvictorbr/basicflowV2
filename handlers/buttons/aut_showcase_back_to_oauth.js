// File: handlers/buttons/aut_showcase_back_to_oauth.js
const db = require('../../database.js'); 
// 1. CORREÇÃO: Alterado o require para o menu de Registros
const { getOAuthHubMenu } = require('../../ui/registros/oauthHubMenu.js'); 

module.exports = {
    customId: 'aut_showcase_back_to_oauth',
    async execute(interaction) {
        
        await interaction.deferUpdate();

        try {
            const guildSettings = await db.getGuildSettings(interaction.guild.id);
            // 2. CORREÇÃO: Alterada a função para chamar o menu correto
            const menu = getOAuthHubMenu(guildSettings);
            await interaction.editReply(menu);

        } catch (error) {
            console.error('Erro ao voltar para menu OAuth (Registros):', error);
            // Tratar erro (opcional, mas recomendado)
            await interaction.editReply({ 
                content: "❌ Ocorreu um erro ao tentar voltar.",
                ephemeral: true
            });
        }
    }
};