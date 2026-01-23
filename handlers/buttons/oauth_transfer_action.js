// File: handlers/buttons/oauth_transfer_action.js (ou o nome que você estiver usando)
const axios = require('axios');

module.exports = {
    // O SEGREDO: Definir o customId como o prefixo para o index.js achar
    customId: 'oauth_transfer_',
    
    async execute(interaction) {
        // 1. Garante que o bot está "pensando" (Defer)
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }
        
        // Formato: oauth_transfer_USERID
        const parts = interaction.customId.split('_');
        const targetId = parts[2]; 
        const guildId = interaction.guild.id;

        // Limpeza da URL para evitar erros de concatenação
        const authUrl = process.env.AUTH_SYSTEM_URL ? process.env.AUTH_SYSTEM_URL.trim().replace(/\/$/, '') : null;

        if (!targetId) return interaction.editReply("❌ Erro: ID do usuário não identificado no botão.");
        if (!authUrl) return interaction.editReply("❌ Erro: URL do sistema não configurada (.env).");

        try {
            // 2. Requisição com TIMEOUT definido (120 segundos)
            // Isso impede que o Axios fique esperando para sempre ou que o Cloudflare corte sem aviso
            const response = await axios.post(`${authUrl}/api/join/${targetId}/${guildId}`, {}, {
                timeout: 120000 // 2 minutos
            });
            
            if (response.data.success) {
                await interaction.editReply({ 
                    content: `✅ **Sucesso!** O comando de entrada foi enviado para <@${targetId}>.` 
                });
            } else {
                await interaction.editReply({ 
                    content: `⚠️ **Retorno da API:** O sistema tentou, mas houve um alerta: ${response.data.message || 'Motivo desconhecido (Talvez já esteja no server ou revogou o token).'}` 
                });
            }
        } catch (error) {
            console.error(`[OAuth Transfer] Erro com usuário ${targetId}:`, error.message);

            let errorMsg = `❌ Erro ao processar: ${error.message}`;

            // 3. Tratamento específico para os erros que estavam aparecendo no seu log
            if (error.response) {
                if (error.response.status === 524) {
                    errorMsg = '⏱️ **Tempo Esgotado (Timeout):** A API demorou muito para responder. O usuário pode ter entrado no background. Verifique a lista de membros.';
                } else if (error.response.status === 500) {
                    errorMsg = '🔥 **Erro Interno na API:** O servidor de verificação falhou (SSL ou Banco de Dados). Tente novamente em alguns minutos.';
                } else {
                    errorMsg = `❌ Erro na API (${error.response.status}): ${error.response.statusText}`;
                }
            } else if (error.code === 'ECONNABORTED') {
                errorMsg = '⏱️ O bot cancelou a conexão pois a API demorou mais de 2 minutos para responder.';
            }

            // Envia a mensagem de erro tratada sem crashar
            await interaction.editReply({ content: errorMsg });
        }
    }
};