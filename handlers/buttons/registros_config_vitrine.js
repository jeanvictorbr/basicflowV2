// handlers/buttons/registros_config_vitrine.js
const db = require('../../database.js');
const generateRegistrosVitrineMenu = require('../../ui/registrosVitrineMenu.js'); // Vamos criar este
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    customId: 'registros_config_vitrine',
    async execute(interaction) {
        await interaction.deferUpdate();

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        const menuPayload = await generateRegistrosVitrineMenu(interaction, settings);

        await interaction.editReply({
            ...menuPayload,
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};