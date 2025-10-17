// handlers/buttons/dev_toggle_bot_status.js
const db = require('../../database.js');
const generateDevMainMenu = require('../../ui/devPanel/mainMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_toggle_bot_status',
    async execute(interaction) {
        await interaction.deferUpdate();

        const currentStatus = (await db.query("SELECT bot_enabled FROM bot_status WHERE status_key = 'main'")).rows[0]?.bot_enabled;
        const newStatus = !currentStatus;
        await db.query('UPDATE bot_status SET bot_enabled = $1 WHERE status_key = $2', [newStatus, 'main']);

        // CORREÇÃO: Busca todos os dados necessários para redesenhar o menu
        const botStatus = (await db.query("SELECT * FROM bot_status WHERE status_key = 'main'")).rows[0];
        const totalGuilds = interaction.client.guilds.cache.size;
        const totalMembers = interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const dailyTokenResult = await db.query("SELECT SUM(total_tokens) as total FROM ai_usage_logs WHERE created_at >= NOW()::date");
        const dailyTokenUsage = parseInt(dailyTokenResult.rows[0]?.total || '0', 10);

        await interaction.editReply({
            components: generateDevMainMenu(botStatus, { totalGuilds, totalMembers }, dailyTokenUsage),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};