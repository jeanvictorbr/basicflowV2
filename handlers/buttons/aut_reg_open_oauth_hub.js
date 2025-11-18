// File: handlers/buttons/aut_reg_open_oauth_hub.js
const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
const { getOAuthHubMenu } = require('../../ui/registros/oauthHubMenu.js'); // Puxa a nova UI

module.exports = {
    customId: 'aut_reg_open_oauth_hub',
    async execute(interaction) {
        
        await interaction.deferUpdate({ flags: EPHEMERAL_FLAG });

        try {
            const settings = await db.getGuildSettings(interaction.guild.id);
            const menu = getOAuthHubMenu(settings || {}); // Passa as settings para o novo hub
            
            await interaction.editReply(menu);

        } catch (error) {
            console.error('Erro ao abrir o Hub de OAuth (Registros):', error);
            await interaction.editReply({ 
                type: 17, 
                flags: V2_FLAG | EPHEMERAL_FLAG,
                accent_color: 0xED4245,
                components: [
                    { "type": 10, "content": "❌ Ocorreu um erro ao carregar este painel." }
                ]
            });
        }
    },
};