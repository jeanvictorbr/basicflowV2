// Crie em: handlers/buttons/dev_guilds_sort_.js
const { getAndPrepareGuildData } = require('../../utils/devPanelUtils.js');
const generateDevGuildsMenu = require('../../ui/devPanel/devGuildsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_guilds_sort_',
    async execute(interaction) {
        // A interação já é deferida pela função que chama esta
        const sortKey = interaction.customId.split('_')[3];
        
        const { allGuildData, totals } = await getAndPrepareGuildData(interaction.client, sortKey);

        await interaction.editReply({
            components: generateDevGuildsMenu(allGuildData, 0, totals, sortKey),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};