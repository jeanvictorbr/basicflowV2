// handlers/buttons/registros_toggle_status.js
const db = require('../../database.js');
const generateRegistrosMenu = require('../../ui/registrosMenu.js');

module.exports = {
    customId: 'registros_toggle_status',
    async execute(interaction) {
        // CORREÇÃO: Adicionado deferUpdate() para evitar que a interação expire
        await interaction.deferUpdate();

        // Alterna o status no banco de dados
        await db.query(`
            UPDATE guild_settings 
            SET registros_status = NOT COALESCE(registros_status, false) 
            WHERE guild_id = $1
        `, [interaction.guild.id]);
        
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        // CORREÇÃO: Passando 'interaction' e usando 'await'
        const menu = await generateRegistrosMenu(interaction, settings);

        // CORREÇÃO: Usando editReply() após deferUpdate()
        await interaction.editReply({ components: menu });
    }
};