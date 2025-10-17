// handlers/buttons/dev_main_menu_back.js
const generateDevMainMenu = require('../../ui/devPanel/mainMenu.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_main_menu_back',
    async execute(interaction) {
        // CORREÇÃO: Este handler agora busca todos os dados necessários, assim como o comando /devpanel.
        if (interaction.isButton()) {
            await interaction.deferUpdate();
        } else {
            await interaction.deferReply({ ephemeral: true });
        }
        
        const botStatus = (await db.query("SELECT * FROM bot_status WHERE status_key = 'main'")).rows[0];
        
        const totalGuilds = interaction.client.guilds.cache.size;
        const totalMembers = interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

        const dailyTokenResult = await db.query(
            "SELECT SUM(total_tokens) as total FROM ai_usage_logs WHERE created_at >= NOW()::date"
        );
        const dailyTokenUsage = parseInt(dailyTokenResult.rows[0]?.total || '0', 10);

        const payload = {
            components: generateDevMainMenu(botStatus, { totalGuilds, totalMembers }, dailyTokenUsage),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        };

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(payload);
        } else {
            await interaction.reply(payload);
        }
    }
};