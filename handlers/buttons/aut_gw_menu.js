const giveawayMenu = require('../../ui/automations/giveawayMenu');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_gw_menu',
    async execute(interaction) {
        await interaction.update({
            components: [giveawayMenu()],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};