// handlers/selects/select_guardian_channels_monitored.js
const db = require('../../database.js');
const generateGuardianChannelsMenu = require('../../ui/guardianChannelsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_guardian_channels_monitored',
    async execute(interaction) {
        const selectedChannels = interaction.values.join(',');
        await db.query(`UPDATE guild_settings SET guardian_ai_monitored_channels = $1 WHERE guild_id = $2`, [selectedChannels, interaction.guild.id]);
        
        await interaction.deferUpdate();
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        await interaction.editReply({
            components: generateGuardianChannelsMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};