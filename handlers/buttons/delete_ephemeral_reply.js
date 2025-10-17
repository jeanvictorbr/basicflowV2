// Crie em: handlers/buttons/delete_ephemeral_reply.js
module.exports = {
    customId: 'delete_ephemeral_reply',
    async execute(interaction) {
        // Simplesmente deleta a mensagem efêmera (o menu de seleção)
        await interaction.message.delete();
    }
};