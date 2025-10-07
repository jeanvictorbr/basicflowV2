// handlers/buttons/guardian_manage_channels.js
const db = require('../../database.js');
const generateGuardianChannelsMenu = require('../../ui/guardianChannelsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'guardian_manage_channels',
    async execute(interaction) {
        await interaction.deferUpdate();
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        await interaction.editReply({
            components: generateGuardianChannelsMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};