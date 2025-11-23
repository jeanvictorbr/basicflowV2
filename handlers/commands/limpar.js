const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = async function(interaction) {
    // 1. Verifica permissões do bot no canal
    if (!interaction.guild.members.me.permissionsIn(interaction.channel).has(['ManageMessages', 'ReadMessageHistory'])) {
        return interaction.reply({
            content: '❌ Eu preciso das permissões **Gerir Mensagens** e **Ver Histórico** neste canal para realizar a limpeza.',
            flags: EPHEMERAL_FLAG
        });
    }

    const amount = interaction.options.getInteger('quantidade');

    await interaction.deferReply({ flags: EPHEMERAL_FLAG });

    try {
        // 2. Executa a limpeza (bulkDelete)
        // O segundo parâmetro 'true' filtra mensagens antigas (>14 dias) que não podem ser apagadas em massa
        const deleted = await interaction.channel.bulkDelete(amount, true);

        // 3. Feedback Inteligente
        if (deleted.size === 0) {
            await interaction.editReply({
                content: '⚠️ Nenhuma mensagem pôde ser apagada. Elas podem ser muito antigas (mais de 14 dias) ou o canal já está vazio.'
            });
        } else if (deleted.size < amount) {
            await interaction.editReply({
                content: `✅ **Limpeza Parcial:** Apaguei **${deleted.size}** mensagens. Algumas não puderam ser excluídas por serem muito antigas.`
            });
        } else {
            await interaction.editReply({
                content: `🧹 **Limpeza Concluída!** Apaguei as últimas **${deleted.size}** mensagens com sucesso.`
            });
        }

    } catch (error) {
        console.error('[Limpar] Erro ao apagar mensagens:', error);
        await interaction.editReply({
            content: '❌ Ocorreu um erro ao tentar apagar as mensagens. Verifique minhas permissões.'
        });
    }
};