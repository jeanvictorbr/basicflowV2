// Local: handlers/buttons/aut_purge_add.js
const { getPurgeChannelSelect } = require('../../ui/automations/purgeChannelSelect');

module.exports = {
    customId: 'aut_purge_add',
    async execute(interaction) {
        // Envia o menu de seleção de canal (V2)
        const payload = getPurgeChannelSelect();
        
        // Usa update se for botão, reply se for comando
        if (interaction.isButton()) {
            await interaction.update(payload);
        } else {
            await interaction.reply(payload);
        }
    },
};