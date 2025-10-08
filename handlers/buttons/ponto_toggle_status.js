// handlers/buttons/ponto_toggle_status.js
const db = require('../../database.js');
const generatePontoMenu = require('../../ui/pontoMenu.js');
const V2_FLAG = 1 << 15; 
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'ponto_toggle_status',
    async execute(interaction) {
        await db.query(`UPDATE guild_settings SET ponto_status = NOT COALESCE(ponto_status, false) WHERE guild_id = $1`, [interaction.guild.id]);
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        
        // CORRIGIDO: Passa o objeto 'interaction' para a função de UI
        const menu = await generatePontoMenu(interaction, settingsResult.rows[0]);
        
        await interaction.update({ 
            components: menu, 
            flags: V2_FLAG | EPHEMERAL_FLAG 
        });
    }
};