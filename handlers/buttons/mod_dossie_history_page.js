// handlers/buttons/mod_dossie_history_page.js
const generateDossieEmbed = require('../../ui/dossieEmbed.js');

module.exports = {
    customId: 'mod_dossie_history_page_',
    async execute(interaction) {
        const [,,, targetUserId, pageStr] = interaction.customId.split('_');
        const page = parseInt(pageStr, 10);
        if (isNaN(page)) return;
        
        await interaction.deferUpdate();
        
        // CORREÇÃO CRÍTICA: Busca o objeto de usuário COMPLETO a partir do ID salvo no botão.
        // Isso garante que temos acesso a funções como .displayAvatarURL() e .username
        const targetUser = await interaction.client.users.fetch(targetUserId);
        
        const dossie = await generateDossieEmbed(interaction, targetUser, page);

        await interaction.editReply(dossie);
    }
};