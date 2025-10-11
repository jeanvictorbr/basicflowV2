// Crie em: handlers/buttons/dev_guild_force_leave_confirm_.js
const db = require('../../database.js');
const generateDevMainMenu = require('../../ui/devPanel/mainMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_guild_force_leave_confirm_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const guildId = interaction.customId.split('_')[5];
        const guild = await interaction.client.guilds.fetch(guildId).catch(() => null);

        if (guild) {
            await guild.leave();
        }
        
        await interaction.followUp({ content: `✅ O bot saiu do servidor **${guild?.name || guildId}** com sucesso.`, ephemeral: true });

        // Volta ao menu principal do devpanel
        const botStatus = (await db.query("SELECT * FROM bot_status WHERE status_key = 'main'")).rows[0];
        const totalGuilds = interaction.client.guilds.cache.size;
        const totalMembers = interaction.client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);

        await interaction.editReply({
            components: generateDevMainMenu(botStatus, { totalGuilds, totalMembers }),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};