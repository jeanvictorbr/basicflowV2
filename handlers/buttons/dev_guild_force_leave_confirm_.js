// Substitua em: handlers/buttons/dev_guild_force_leave_confirm_.js
const db = require('../../database.js');
const generateDevMainMenu = require('../../ui/devPanel/mainMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    // CORREÇÃO: Atualizado para o novo ID sem conflito
    customId: 'dev_guild_confirm_leave_',
    async execute(interaction) {
        await interaction.deferUpdate();

        // Extrai o ID usando a nova estrutura (dev_guild_confirm_leave_GUILDID)
        // Split: 0:dev, 1:guild, 2:confirm, 3:leave, 4:GUILDID
        const guildId = interaction.customId.split('_')[4];

        const guild = await interaction.client.guilds.fetch(guildId).catch(() => null);
        const guildName = guild ? guild.name : guildId;

        if (guild) {
            try {
                await guild.leave();
                console.log(`[DEV] Forçado a sair da guilda: ${guildName} (${guildId})`);
            } catch (error) {
                console.error(`[DEV] Erro ao sair da guilda ${guildId}:`, error);
                return interaction.followUp({ content: `❌ Erro ao tentar sair da guilda: ${error.message}`, flags: EPHEMERAL_FLAG });
            }
        } else {
            console.log(`[DEV] Tentativa de sair de guilda inexistente: ${guildId}`);
        }
        
        await interaction.followUp({ content: `✅ O bot saiu do servidor **${guildName}** com sucesso.`, flags: EPHEMERAL_FLAG });

        // Atualiza os dados e volta ao menu principal
        const botStatus = (await db.query("SELECT * FROM bot_status WHERE status_key = 'main'")).rows[0];
        const totalGuilds = interaction.client.guilds.cache.size;
        const totalMembers = interaction.client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
        
        // Para o contador diário, uma query simples para evitar erro se a tabela estiver vazia
        const dailyTokenResult = await db.query("SELECT SUM(total_tokens) as total FROM ai_usage_logs WHERE created_at >= NOW()::date");
        const dailyTokenUsage = parseInt(dailyTokenResult.rows[0]?.total || '0', 10);

        await interaction.editReply({
            components: generateDevMainMenu(botStatus, { totalGuilds, totalMembers }, dailyTokenUsage),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};