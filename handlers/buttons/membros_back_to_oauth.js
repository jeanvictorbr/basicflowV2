// File: handlers/buttons/membros_back_to_oauth.js
const db = require('../../database.js'); 
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js'); 
// 1. CORREÇÃO: Alterado o caminho para importar o Hub de OAuth dos Registros
const { getOAuthHubMenu } = require('../../ui/registros/oauthHubMenu.js'); 

module.exports = {
    customId: 'membros_back_to_oauth',
    async execute(interaction) {
        
        await interaction.deferUpdate({ flags: EPHEMERAL_FLAG });

        try {
            const guildSettings = await db.getGuildSettings(interaction.guild.id);
            // 2. CORREÇÃO: Alterada a função para chamar o menu correto
            const menu = getOAuthHubMenu(guildSettings);
            await interaction.editReply(menu);

        } catch (error) {
            console.error('Erro ao voltar para menu OAuth (Registros):', error); // Mensagem de erro atualizada
            await interaction.editReply({ 
                type: 17, 
                flags: V2_FLAG | EPHEMERAL_FLAG,
                accent_color: 0xED4245, // Vermelho
                components: [
                    {
                        "type": 10, // Text Component
                        "content": "❌ Ocorreu um erro ao tentar voltar."
                    }
                ]
            });
        }
    }
};