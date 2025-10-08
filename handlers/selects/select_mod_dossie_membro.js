// Substitua o conteúdo em: handlers/selects/select_mod_dossie_membro.js
const generateDossieEmbed = require('../../ui/dossieEmbed.js');

module.exports = {
    customId: 'select_mod_dossie_membro',
    async execute(interaction) {
        // Adia a atualização da mensagem original
        await interaction.deferUpdate();

        const memberId = interaction.values[0];
        const member = await interaction.guild.members.fetch(memberId).catch(() => null);

        if (!member) {
            return interaction.followUp({ content: '❌ Membro não encontrado.', ephemeral: true });
        }

        // Chama a função de UI de forma correta, que agora busca os dados e gera o payload
        const dossiePayload = await generateDossieEmbed(interaction, member, 0);

        // Edita a mensagem original (que continha o menu) para mostrar o dossiê
        // Não são necessárias flags V2, pois o dossiê usa embeds e componentes padrão
        await interaction.editReply(dossiePayload);
    }
};