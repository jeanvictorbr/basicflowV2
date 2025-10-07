// Crie em: handlers/buttons/mod_toggle_tempban.js
const db = require('../../database.js');
const generateModeracaoMenu = require('../../ui/moderacaoMenu.js');
const isPremiumActive = require('../../utils/premiumCheck.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_toggle_tempban',
    async execute(interaction) {
        const isPremium = await isPremiumActive(interaction.guild.id);
        if (!isPremium) {
            return interaction.reply({ content: 'Esta é uma funcionalidade premium.', ephemeral: true });
        }

        await interaction.deferUpdate();
        await db.query(`UPDATE guild_settings SET mod_temp_ban_enabled = NOT COALESCE(mod_temp_ban_enabled, false) WHERE guild_id = $1`, [interaction.guild.id]);
        
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        await interaction.editReply({
            components: generateModeracaoMenu(settings, isPremium),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};