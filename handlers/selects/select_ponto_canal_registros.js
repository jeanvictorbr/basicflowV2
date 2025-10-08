// handlers/selects/select_ponto_canal_registros.js
const db = require('../../database.js');
const generatePontoMenu = require('../../ui/pontoMenu.js');
const V2_FLAG = 1 << 15; 
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_ponto_canal_registros',
    async execute(interaction) {
        const channelId = interaction.values[0];
        await db.query(`UPDATE guild_settings SET ponto_canal_registros = $1 WHERE guild_id = $2`, [channelId, interaction.guild.id]);
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        
        // CORRIGIDO: Passa o objeto 'interaction' para a função de UI
        const menu = await generatePontoMenu(interaction, settingsResult.rows[0]);

        await interaction.update({ 
            components: menu, 
            flags: V2_FLAG | EPHEMERAL_FLAG 
        });
    }
};