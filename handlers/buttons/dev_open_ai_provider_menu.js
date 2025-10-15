// handlers/buttons/dev_open_ai_provider_menu.js
const db = require('../../database.js');
const generateDevAiProviderMenu = require('../../ui/devPanel/devAiProviderMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_open_ai_provider_menu',
    async execute(interaction) {
        await interaction.deferUpdate();
        const botStatus = (await db.query("SELECT * FROM bot_status WHERE status_key = 'main'")).rows[0];
        await interaction.editReply({
            components: generateDevAiProviderMenu(botStatus),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};