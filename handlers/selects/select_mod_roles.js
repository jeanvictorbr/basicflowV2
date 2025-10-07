// Crie em: handlers/selects/select_mod_roles.js
const db = require('../../database.js');
const generateModeracaoMenu = require('../../ui/moderacaoMenu.js');
const isPremiumActive = require('../../utils/premiumCheck.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_mod_roles',
    async execute(interaction) {
        await interaction.deferUpdate();
        const roleIds = interaction.values.join(',');

        await db.query(`UPDATE guild_settings SET mod_roles = $1 WHERE guild_id = $2`, [roleIds, interaction.guild.id]);
        
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const isPremium = await isPremiumActive(interaction.guild.id);

        await interaction.editReply({
            components: generateModeracaoMenu(settings, isPremium),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};