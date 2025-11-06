// handlers/buttons/open_registros_menu.js
const db = require('../../database.js');
const generateRegistrosMenu = require('../../ui/registrosMenu.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    customId: 'open_registros_menu',
    async execute(interaction) {
        await interaction.deferUpdate();

        // 1. Buscar as configurações atualizadas
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        const settings = settingsResult.rows[0] || {};

        // 2. Gerar o payload V2 completo do menu de registros
        const menuPayload = await generateRegistrosMenu(interaction, settings);

        // 3. CORREÇÃO: Enviar o payload V2 diretamente, espalhando (spread)
        //    o objeto para adicionar as flags, em vez de aninhá-lo em 'components'.
        await interaction.editReply({
            ...menuPayload,
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};