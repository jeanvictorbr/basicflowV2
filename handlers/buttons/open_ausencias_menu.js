// handlers/buttons/open_ausencias_menu.js
const db = require('../../database.js');
const generateAusenciasMenu = require('../../ui/ausenciasMenu.js');

const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'open_ausencias_menu',
    async execute(interaction) {
        // Assegura que a guild tem um registro no DB
        await db.query(`INSERT INTO guild_settings (guild_id) VALUES ($1) ON CONFLICT (guild_id) DO NOTHING`, [interaction.guild.id]);

        // Busca as configurações atuais
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        const settings = settingsResult.rows[0] || {};

        // Atualiza a mensagem com o menu de ausências, usando as flags corretas
        await interaction.update({
            components: generateAusenciasMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};