const generateServerInfoEmbed = require('../../ui/serverInfoEmbed.js');
// Importa a flag de efêmero (invisível)
const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = async function(interaction) {
    // Adiciona a flag aqui para tornar a resposta privada
    await interaction.deferReply({ flags: EPHEMERAL_FLAG }); 

    try {
        // Garante que o cache de canais e membros esteja atualizado para contagem correta
        await interaction.guild.channels.fetch();
        
        // Gera a UI
        const payload = await generateServerInfoEmbed(interaction.guild);
        
        await interaction.editReply(payload);
    } catch (error) {
        console.error('[ServerInfo] Erro:', error);
        await interaction.editReply({ content: '❌ Ocorreu um erro ao buscar as informações do servidor.' });
    }
};