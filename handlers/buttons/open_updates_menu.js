// handlers/buttons/open_updates_menu.js
const generateUpdatesMenu = require('../../ui/updatesMenu');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'open_updates_menu',
    async execute(interaction) {
        await interaction.deferUpdate();
        const menuComponents = await generateUpdatesMenu(interaction);

        await interaction.editReply({
            components: menuComponents,
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};