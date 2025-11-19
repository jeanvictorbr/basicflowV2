// File: handlers/buttons/membros_guild_page.js
const { getMembrosAdminHub } = require('../../ui/admin/membrosAdminHub.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    // Captura IDs como: membros_guild_page_0, membros_guild_page_1, etc.
    customId: 'membros_guild_page_',
    async execute(interaction) {
        await interaction.deferUpdate();

        try {
            // Extrair o número da página do ID
            // Ex: "membros_guild_page_2" -> split('_') -> pega o último item "2"
            const parts = interaction.customId.split('_');
            const page = parseInt(parts[parts.length - 1]);

            // Gerar o menu com a nova página
            // Precisamos limpar o cache do require para garantir atualização se houver mudanças
            delete require.cache[require.resolve('../../ui/admin/membrosAdminHub.js')];
            const { getMembrosAdminHub: generateMenu } = require('../../ui/admin/membrosAdminHub.js');

            const menu = await generateMenu(interaction, page);
            
            await interaction.editReply(menu);

        } catch (error) {
            console.error('Erro ao mudar página de guildas:', error);
            await interaction.followUp({ 
                content: '❌ Erro ao carregar página.', 
                flags: EPHEMERAL_FLAG 
            });
        }
    }
};