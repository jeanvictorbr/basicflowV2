// Substitua em: handlers/selects/select_registros_canal_logs.js
const db = require('../../database.js');
const generateRegistrosMenu = require('../../ui/registrosMenu.js');

const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_registros_canal_logs',
    async execute(interaction) {
        const channelId = interaction.values[0];
        await db.query(`UPDATE guild_settings SET registros_canal_logs = $1 WHERE guild_id = $2`, [channelId, interaction.guild.id]);
        
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        
        // CORREÇÃO: Passa 'interaction' e garante que 'settings' seja um objeto.
        const menu = await generateRegistrosMenu(interaction, settingsResult.rows[0] || {});

        await interaction.update({ 
            components: menu, 
            flags: V2_FLAG | EPHEMERAL_FLAG 
        });
    }
};