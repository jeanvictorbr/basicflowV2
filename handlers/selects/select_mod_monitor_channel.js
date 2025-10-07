// Crie em: handlers/selects/select_mod_monitor_channel.js
const db = require('../../database.js');
const generateModeracaoPremiumHub = require('../../ui/moderacaoPremiumHub.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_mod_monitor_channel',
    async execute(interaction) {
        await interaction.deferUpdate();
        const channelId = interaction.values[0] || null;
        await db.query(`UPDATE guild_settings SET mod_monitor_channel = $1 WHERE guild_id = $2`, [channelId, interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        await interaction.editReply({
            components: generateModeracaoPremiumHub(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};