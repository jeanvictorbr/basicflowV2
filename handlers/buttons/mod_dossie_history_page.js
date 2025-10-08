// handlers/buttons/mod_dossie_history_page.js
const generateDossieEmbed = require('../../ui/dossieEmbed.js');

module.exports = {
    customId: 'mod_dossie_history_page_',
    async execute(interaction) {
        const [,,, targetUserId, pageStr] = interaction.customId.split('_');
        const page = parseInt(pageStr, 10);
        if (isNaN(page)) return;
        
        await interaction.deferUpdate();
        
        // CORREÇÃO: Busca o objeto completo do usuário a partir do ID
        const targetUser = await interaction.client.users.fetch(targetUserId);
        
        // CORREÇÃO: Usando 'await' e passando o objeto de usuário correto
        const dossie = await generateDossieEmbed(interaction, targetUser, page);

        await interaction.editReply(dossie);
    }
};