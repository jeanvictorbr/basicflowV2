// Arquivo: handlers/commands/voz.js (ou commands/voz.js)

module.exports = {
    // Se houver outras propriedades aqui (como 'data' ou 'name'), mantenha-as.
    // Apenas substitua ou adicione o método 'execute' abaixo:

    async execute(interaction) {
        // Responde imediatamente avisando da manutenção
        await interaction.reply({ 
            content: '🚧 **O sistema de voz está DESATIVADO TEMPORARIAMENTE PARA MANUTENÇÃO.** 🚧\nPor favor, tente novamente mais tarde.', 
            ephemeral: true // Apenas quem usou o comando vê a mensagem
        });
    }
};