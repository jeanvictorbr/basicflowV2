// File: handlers/buttons/oauth_remove_verify.js
const axios = require('axios');
const manager = require('./aut_oauth_manage_members.js');

module.exports = {
    // Captura o botão que começa com 'oauth_remove_'
    customId: 'oauth_remove_',
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        // oauth_remove_USERID
        const targetUserId = interaction.customId.split('_')[2];

        let authUrl = process.env.AUTH_SYSTEM_URL.trim().replace(/\/$/, '').replace('/auth/callback', '');

        try {
            const response = await axios.delete(`${authUrl}/api/users/${targetUserId}`);
            
            if (response.data.success) {
                await interaction.editReply(`✅ **Sucesso!** A verificação do usuário <@${targetUserId}> foi removida do sistema.\n*(Ele não foi expulso do servidor, apenas desvinculado do Auth)*`);
                
                // Tenta atualizar a lista para sumir o usuário removido
                // (Pode falhar se a interação original já tiver expirado, mas tentamos)
                try {
                   // await manager.loadMembersPage(interaction.message, 1); 
                   // Complicado atualizar a mensagem original daqui sem acesso direto.
                   // O usuário pode clicar em atualizar/paginação depois.
                } catch(e) {}

            } else {
                await interaction.editReply(`⚠️ **Falha:** Não foi possível remover.`);
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply(`❌ **Erro:** ${error.message}`);
        }
    }
};