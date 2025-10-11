// Substitua o conteúdo em: handlers/buttons/dev_guilds_page.js
const { getAndPrepareGuildData } = require('../../utils/devPanelUtils.js');
const generateDevGuildsMenu = require('../../ui/devPanel/devGuildsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_guilds_page_',
    async execute(interaction) {
        const parts = interaction.customId.split('_');
        const page = parseInt(parts[3], 10);
        const sortKey = parts[4] || 'default';
        if (isNaN(page)) return;

        await interaction.deferUpdate();
        
        const { allGuildData, totals } = await getAndPrepareGuildData(interaction.client, sortKey);
        
        await interaction.editReply({
            components: generateDevGuildsMenu(allGuildData, page, totals, sortKey),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};