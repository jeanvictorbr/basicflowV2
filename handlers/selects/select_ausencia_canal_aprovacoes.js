// handlers/selects/select_ausencia_canal_aprovacoes.js
const db = require('../../database.js');
const generateAusenciasMenu = require('../../ui/ausenciasMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_ausencia_canal_aprovacoes',
    async execute(interaction) {
        const selectedChannelId = interaction.values[0];
        await db.query(`UPDATE guild_settings SET ausencias_canal_aprovacoes = $1 WHERE guild_id = $2`, [selectedChannelId, interaction.guild.id]);

        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        
        // CORRIGIDO: Passa 'interaction' para a função de UI
        const menu = await generateAusenciasMenu(interaction, settingsResult.rows[0]);

        await interaction.update({
            content: null,
            components: menu,
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};