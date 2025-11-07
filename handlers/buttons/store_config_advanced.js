// handlers/buttons/store_config_advanced.js
const db = require('../../database.js');
const generateConfigAdvancedMenu = require('../../ui/store/configAdvancedMenu.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    customId: 'store_config_advanced',
    async execute(interaction) {
        await interaction.deferUpdate();

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const menuPayload = await generateConfigAdvancedMenu(interaction, settings);

        // --- INÍCIO DA CORREÇÃO ---
        // O menuPayload já é o objeto V2 completo ({ type: 17, ... }).
        // Devemos usar o spread operator (...) para adicioná-lo à raiz da resposta,
        // e não passá-lo dentro de 'components'.
        await interaction.editReply({ 
            ...menuPayload, 
            flags: V2_FLAG | EPHEMERAL_FLAG 
        });
        // --- FIM DA CORREÇÃO ---
    }
};