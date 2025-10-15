// handlers/buttons/dev_set_ai_provider_.js
const db = require('../../database.js');
const generateDevAiProviderMenu = require('../../ui/devPanel/devAiProviderMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_set_ai_provider_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const provider = interaction.customId.split('_')[4];

        await db.query("UPDATE bot_status SET active_ai_provider = $1 WHERE status_key = 'main'", [provider]);

        const botStatus = (await db.query("SELECT * FROM bot_status WHERE status_key = 'main'")).rows[0];
        await interaction.editReply({
            components: generateDevAiProviderMenu(botStatus),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });

        await interaction.followUp({ content: `✅ Provedor de IA alterado para **${provider.toUpperCase()}**!`, ephemeral: true });
    }
};