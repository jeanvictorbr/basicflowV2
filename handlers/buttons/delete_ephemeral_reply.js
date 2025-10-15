// Crie em: handlers/buttons/delete_ephemeral_reply.js
module.exports = {
    customId: 'delete_ephemeral_reply',
    async execute(interaction) {
        // CORREÇÃO: Adicionado um try...catch para ignorar o erro se a mensagem já foi deletada.
        try {
            await interaction.message.delete();
        } catch (error) {
            // Ignora o erro 'Unknown Message', pois a mensagem já não existe.
            if (error.code !== 10008) {
                console.error("Erro ao deletar resposta efêmera:", error);
            }
        }
    }
};