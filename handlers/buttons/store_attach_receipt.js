// Crie em: handlers/buttons/store_attach_receipt.js
module.exports = {
    customId: 'store_attach_receipt',
    async execute(interaction) {
        // Este botão apenas envia uma mensagem instrucional
        await interaction.reply({
            content: 'Por favor, envie a imagem do seu comprovante de pagamento diretamente neste canal.',
            ephemeral: true
        });
    }
};