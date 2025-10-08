// handlers/selects/select_dev_manage_guild.js
const db = require('../../database.js');
const generateDevGuildManageMenu = require('../../ui/devPanel/devGuildManageMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_dev_manage_guild',
    async execute(interaction) {
        await interaction.deferUpdate();
        const guildId = interaction.values[0];
        
        const guild = interaction.client.guilds.cache.get(guildId);
        if (!guild) {
            return interaction.followUp({ content: 'Guilda não encontrada.', ephemeral: true });
        }

        await db.query('INSERT INTO guild_settings (guild_id) VALUES ($1) ON CONFLICT (guild_id) DO NOTHING', [guildId]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0];

        await interaction.editReply({
            components: generateDevGuildManageMenu(guild, settings),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};