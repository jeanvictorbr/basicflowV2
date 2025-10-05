// handlers/selects/select_ausencia_cargo.js
const db = require('../../database.js');
const generateAusenciasMenu = require('../../ui/ausenciasMenu.js');

module.exports = {
    customId: 'select_ausencia_cargo',
    async execute(interaction) {
        const selectedRoleId = interaction.values[0];
        const guildId = interaction.guild.id;

        // Salva o ID do cargo no banco de dados
        await db.query(`UPDATE guild_settings SET ausencias_cargo_ausente = $1 WHERE guild_id = $2`, [selectedRoleId, guildId]);

        // Busca as configurações atualizadas
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId]);
        const newSettings = settingsResult.rows[0];

        // Retorna ao menu de ausências com a informação atualizada
        await interaction.update({
            content: '', // Limpa o conteúdo de texto anterior
            components: generateAusenciasMenu(newSettings)
        });
    }
};