// handlers/buttons/store_config_advanced.js
const db = require('../../database.js');
const generateConfigAdvancedMenu = require('../../ui/store/configAdvancedMenu.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    customId: 'store_config_advanced',
    async execute(interaction) {
        // Adia a atualização para evitar timeout
        await interaction.deferUpdate();

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        // A função UI retorna um ARRAY: [ { type: 17, ... } ]
        const menuPayloadArray = await generateConfigAdvancedMenu(interaction, settings);

        // --- CORREÇÃO AQUI ---
        // Pegamos o PRIMEIRO item do array (o objeto da interface)
        const payload = menuPayloadArray[0];

        // Adicionamos as flags necessárias no objeto raiz
        payload.flags = V2_FLAG | EPHEMERAL_FLAG;

        // Enviamos o objeto correto
        await interaction.editReply(payload);
    }
};