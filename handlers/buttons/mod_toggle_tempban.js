// handlers/buttons/mod_toggle_tempban.js
const db = require('../../database.js');
const generateModeracaoMenu = require('../../ui/moderacaoMenu.js');
const hasFeature = require('../../utils/featureCheck.js'); // CORRIGIDO
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_toggle_tempban',
    async execute(interaction) {
        if (!await hasFeature(interaction.guild.id, 'MODERATION_PREMIUM')) { // CORRIGIDO
            return interaction.reply({ content: 'Esta é uma funcionalidade premium.', ephemeral: true });
        }

        await interaction.deferUpdate();
        await db.query(`UPDATE guild_settings SET mod_temp_ban_enabled = NOT COALESCE(mod_temp_ban_enabled, false) WHERE guild_id = $1`, [interaction.guild.id]);
        
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        const menu = await generateModeracaoMenu(interaction, settings); // CORRIGIDO
        await interaction.editReply({
            components: menu,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};