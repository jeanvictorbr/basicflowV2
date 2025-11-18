// File: handlers/buttons/aut_oauth_config_showcase.js
const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
const { getCloudflowVerifyShowcaseMenu } = require('../../ui/automations/cloudflowVerifyShowcaseMenu.js');

module.exports = {
    customId: 'aut_oauth_config_showcase',
    async execute(interaction) {
        await interaction.deferUpdate({ flags: EPHEMERAL_FLAG });
        try {
            const settings = await db.getGuildSettings(interaction.guild.id);
            const menu = getCloudflowVerifyShowcaseMenu(settings || {});
            await interaction.editReply(menu);
        } catch (error) {
            console.error("Erro ao abrir menu da vitrine:", error);
            await interaction.editReply({ 
                type: 17, flags: V2_FLAG | EPHEMERAL_FLAG, accent_color: 0xED4245,
                components: [{ "type": 10, "content": "❌ Ocorreu um erro ao carregar este menu." }]
            });
        }
    }
};