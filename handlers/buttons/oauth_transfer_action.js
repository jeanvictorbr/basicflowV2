const axios = require('axios');

module.exports = {
    // O SEGREDO: Definir o customId como o prefixo para o index.js achar
    customId: 'oauth_transfer_',
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        // Formato: oauth_transfer_USERID
        const parts = interaction.customId.split('_');
        // parts[0]=oauth, parts[1]=transfer, parts[2]=USERID
        const targetId = parts[2]; 
        const guildId = interaction.guild.id;
        const authUrl = process.env.AUTH_SYSTEM_URL;

        if (!targetId) return interaction.editReply("❌ Erro: ID do usuário não identificado no botão.");

        try {
            const response = await axios.post(`${authUrl}/api/join/${targetId}/${guildId}`);
            
            if (response.data.success) {
                await interaction.editReply({ 
                    content: `✅ **Sucesso!** O comando de entrada foi enviado para <@${targetId}>.` 
                });
            } else {
                await interaction.editReply({ 
                    content: `⚠️ **Falha:** O sistema tentou, mas não conseguiu. O usuário pode já estar no servidor, ter atingido o limite de guilds ou revogado o acesso.` 
                });
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `❌ Erro ao processar: ${error.message}` });
        }
    }
};