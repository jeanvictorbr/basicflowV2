// handlers/buttons/dev_toggle_ai.js
const db = require('../../database.js');
const generateDevMainMenu = require('../../ui/devPanel/mainMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_toggle_ai',
    async execute(interaction) {
        await interaction.deferUpdate();

        try {
            const currentStatusResult = await db.query("SELECT ai_services_enabled FROM bot_status WHERE status_key = 'main'");
            const currentStatus = currentStatusResult.rows[0]?.ai_services_enabled;

            const newStatus = !currentStatus;
            await db.query("UPDATE bot_status SET ai_services_enabled = $1 WHERE status_key = 'main'", [newStatus]);

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

        } catch (error) {
            console.error('Erro ao alternar o status da IA:', error);
            await interaction.followUp({ content: 'Ocorreu um erro ao tentar alternar o status dos serviços de IA.', ephemeral: true });
        }
    }
};