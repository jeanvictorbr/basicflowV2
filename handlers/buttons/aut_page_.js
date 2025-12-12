const buildAutomationsMenu = require('../../ui/automations/mainMenu');
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'aut_page_',
    async execute(interaction) {
        const page = parseInt(interaction.customId.split('_').pop());
        const menu = await buildAutomationsMenu(interaction, page);
        
        await interaction.update({ 
            components: menu[0].components, 
            flags: V2_FLAG 
        });
    }
};