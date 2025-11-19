const devPanelUtils = require('../../utils/devPanelUtils.js');
const generateDevGuildsMenu = require('../../ui/devPanel/devGuildsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    // Captura: dev_guilds_page_NUMERO_TIPO
    customId: 'dev_guilds_page_',
    async execute(interaction) {
        await interaction.deferUpdate();

        // Parse do ID: dev_guilds_page_1_inactive
        const parts = interaction.customId.split('_');
        // parts[0]=dev, [1]=guilds, [2]=page, [3]=numero, [4]=sortType (opcional)
        
        const page = parseInt(parts[3]);
        const sortType = parts[4] || 'default'; // Se não tiver, usa default

        try {
            const { allGuildData, totals } = await devPanelUtils.getAndPrepareGuildData(interaction.client, sortType);
            
            await interaction.editReply({
                components: generateDevGuildsMenu(allGuildData, page, totals, sortType),
                flags: V2_FLAG | EPHEMERAL_FLAG,
            });
        } catch (error) {
            console.error('Erro na paginação:', error);
        }
    }
};