// handlers/selects/select_registros_captcha_channel.js
const db = require('../../database.js');
const generateRegistrosMenu = require('../../ui/registrosMenu.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    customId: 'select_registros_captcha_channel',
    async execute(interaction) {
        await interaction.deferUpdate();
        const channelId = interaction.values[0];
        
        await db.query('UPDATE guild_settings SET captcha_verify_channel_id = $1 WHERE guild_id = $2', [channelId, interaction.guild.id]);

        const updatedSettings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const menu = await generateRegistrosMenu(interaction, updatedSettings);
        
        await interaction.editReply({ ...menu, flags: V2_FLAG | EPHEMERAL_FLAG });
        await interaction.followUp({ content: `✅ Canal de verificação definido para <#${channelId}>.`, ephemeral: true });
    }
};