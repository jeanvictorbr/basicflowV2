// Substitua o conteúdo em: handlers/commands/devpanel.js
const generateDevMainMenu = require('../../ui/devPanel/mainMenu.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'devpanel',
    async execute(interaction) {
        if (interaction.user.id !== process.env.DEV_USER_ID) {
            return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
        }
        
        if (interaction.isButton()) {
            await interaction.deferUpdate();
        } else {
            await interaction.deferReply({ ephemeral: true });
        }
        
        await db.query("INSERT INTO bot_status (status_key, ai_services_enabled) VALUES ('main', true) ON CONFLICT (status_key) DO NOTHING");
        const botStatus = (await db.query("SELECT * FROM bot_status WHERE status_key = 'main'")).rows[0];
        
        const totalGuilds = interaction.client.guilds.cache.size;
        const totalMembers = interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

        // --- NOVA LÓGICA ADICIONADA AQUI ---
        // Busca o total de tokens usados hoje (desde a meia-noite)
        const dailyTokenResult = await db.query(
            "SELECT SUM(total_tokens) as total FROM ai_usage_logs WHERE created_at >= NOW()::date"
        );
        const dailyTokenUsage = parseInt(dailyTokenResult.rows[0]?.total || '0', 10);
        // --- FIM DA NOVA LÓGICA ---

        const payload = {
            // Passa o total de tokens para a função que gera o menu
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