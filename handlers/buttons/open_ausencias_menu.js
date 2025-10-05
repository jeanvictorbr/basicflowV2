// handlers/buttons/open_ausencias_menu.js
const db = require('../../database.js');
const generateAusenciasMenu = require('../../ui/ausenciasMenu.js');

module.exports = {
    customId: 'open_ausencias_menu',
    async execute(interaction) {
        // Busca as configurações atuais
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        const settings = settingsResult.rows[0] || {};

        // Atualiza a mensagem com o menu de ausências
        await interaction.update({ components: generateAusenciasMenu(settings) });
    }
};