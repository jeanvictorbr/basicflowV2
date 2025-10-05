// handlers/selects/select_ausencia_canal_aprovacoes.js
const db = require('../../database.js');
const generateAusenciasMenu = require('../../ui/ausenciasMenu.js');

module.exports = {
    customId: 'select_ausencia_canal_aprovacoes',
    async execute(interaction) {
        const selectedValue = interaction.values[0];
        const guildId = interaction.guild.id;

        // Salva no banco de dados
        await db.query(`UPDATE guild_settings SET ausencias_canal_aprovacoes = $1 WHERE guild_id = $2`, [selectedValue, guildId]);
        
        // Busca as configurações atualizadas
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId]);
        const newSettings = settingsResult.rows[0];

        // Retorna ao menu de ausências com a informação atualizada
        await interaction.update({ components: generateAusenciasMenu(newSettings) });
    }
};