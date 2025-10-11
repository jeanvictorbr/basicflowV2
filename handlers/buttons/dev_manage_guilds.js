// Substitua o conteúdo em: handlers/buttons/dev_manage_guilds.js
const { getAndPrepareGuildData } = require('../../utils/devPanelUtils.js');
const generateDevGuildsMenu = require('../../ui/devPanel/devGuildsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_manage_guilds',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        const { allGuildData, totals } = await getAndPrepareGuildData(interaction.client);
        
        await interaction.editReply({
            components: generateDevGuildsMenu(allGuildData, 0, totals, 'default'),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};