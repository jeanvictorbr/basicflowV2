// handlers/buttons/registros_toggle_status.js
const db = require('../../database.js');
const generateRegistrosMenu = require('../../ui/registrosMenu.js');

module.exports = {
    customId: 'registros_toggle_status',
    async execute(interaction) {
        // CORREÇÃO: Adicionado deferUpdate
        await interaction.deferUpdate();

        await db.query(`
            UPDATE guild_settings 
            SET registros_status = NOT COALESCE(registros_status, false) 
            WHERE guild_id = $1
        `, [interaction.guild.id]);
        
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        // CORREÇÃO: Usando 'await' e passando 'interaction'
        const menu = await generateRegistrosMenu(interaction, settings);

        // CORREÇÃO: Usando editReply
        await interaction.editReply({ components: menu });
    }
};