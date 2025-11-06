const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
	customId: 'anuncio_cancel_', // CustomId dinâmico: anuncio_cancel_CHANNELID
	async execute(interaction, client, db) {
        // 1. Desabilita os botões para indicar a ação
        await interaction.deferUpdate();

        // 2. Apaga a mensagem ephemera (melhor experiência do usuário)
        await interaction.deleteReply()
            .then(() => {
                // A mensagem foi apagada com sucesso, não é necessário mais feedback.
            })
            .catch(error => {
                console.error('Erro ao apagar a mensagem de preview do anúncio:', error);
                // Se falhar, edita para pelo menos informar o cancelamento
                interaction.editReply({ 
                    content: '❌ | **Anúncio Cancelado.** (Atenção: Falha ao remover a mensagem de controle. Por favor, apague-a manualmente se for necessário.)',
                    components: [],
                });
            });
        
        // Não há log para cancelamento simples, apenas para manter o foco nos logs de publicação.
	},
};