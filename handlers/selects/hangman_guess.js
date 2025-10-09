// CÓDIGO DE TESTE TEMPORÁRIO
module.exports = {
    customId: 'hangman_guess_select_', // Handler dinâmico
    async execute(interaction) {
        // A única função deste código é provar que ele foi carregado e executado.
        await interaction.reply({
            content: `✅ SUCESSO! O handler de SELECT correto foi acionado! Você escolheu a letra: **${interaction.values[0]}**`,
            ephemeral: true
        });
    }
};