const devPanelUtils = require('../../utils/devPanelUtils.js');
const generateDevGuildsMenu = require('../../ui/devPanel/devGuildsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    // Captura 'dev_guilds_sort_default', 'dev_guilds_sort_inactive', etc.
    customId: 'dev_guilds_sort_',
    async execute(interaction) {
        await interaction.deferUpdate();

        // Extrair o tipo de ordenação do ID (ex: dev_guilds_sort_inactive -> inactive)
        const sortType = interaction.customId.replace('dev_guilds_sort_', '');

        try {
            // Buscar dados já ordenados pelo Utils
            const { allGuildData, totals } = await devPanelUtils.getAndPrepareGuildData(interaction.client, sortType);
            
            // Resetar para a página 0 ao mudar a ordenação
            await interaction.editReply({
                components: generateDevGuildsMenu(allGuildData, 0, totals, sortType),
                flags: V2_FLAG | EPHEMERAL_FLAG,
            });
        } catch (error) {
            console.error('Erro ao ordenar guildas:', error);
            await interaction.followUp({ content: 'Erro ao ordenar.', flags: EPHEMERAL_FLAG });
        }
    }
};