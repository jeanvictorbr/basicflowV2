// handlers/buttons/registros_captcha_toggle_system.js
const db = require('../../database.js');
const generateRegistrosMenu = require('../../ui/registrosMenu.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    customId: 'registros_captcha_toggle_system',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        const settingsResult = await db.query('SELECT captcha_verify_enabled FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        const newStatus = !settingsResult.rows[0]?.captcha_verify_enabled;

        await db.query('UPDATE guild_settings SET captcha_verify_enabled = $1 WHERE guild_id = $2', [newStatus, interaction.guild.id]);

        const updatedSettings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const menu = await generateRegistrosMenu(interaction, updatedSettings);
        
        await interaction.editReply({ ...menu, flags: V2_FLAG | EPHEMERAL_FLAG });
        await interaction.followUp({ content: `✅ Sistema de CAPTCHA ${newStatus ? 'ativado' : 'desativado'}.`, ephemeral: true });
    }
};