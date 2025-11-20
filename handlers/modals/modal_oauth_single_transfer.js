// File: handlers/modals/modal_oauth_single_transfer.js
const axios = require('axios');

module.exports = {
    // Captura o modal que começa com 'modal_oauth_single_'
    customId: 'modal_oauth_single_',
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        // Recupera o ID do usuário do customId do modal
        const targetUserId = interaction.customId.split('_')[3]; // modal_oauth_single_USERID
        const targetGuildId = interaction.fields.getTextInputValue('target_guild_id');

        let authUrl = process.env.AUTH_SYSTEM_URL;
        if(!authUrl) return interaction.editReply("❌ URL do Auth System não configurada.");
        authUrl = authUrl.trim().replace(/\/$/, '').replace('/auth/callback', '');

        try {
            const response = await axios.post(`${authUrl}/api/join/${targetUserId}/${targetGuildId}`);
            
            if (response.data.success) {
                await interaction.editReply(`✅ **Sucesso!** O comando foi enviado.\n👤 Usuário: <@${targetUserId}>\n🏰 Destino: \`${targetGuildId}\``);
            } else {
                await interaction.editReply(`⚠️ **Falha:** O sistema tentou, mas não conseguiu adicionar o membro.`);
            }

        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.msg || error.message;
            await interaction.editReply(`❌ **Erro ao processar:** ${msg}`);
        }
    }
};