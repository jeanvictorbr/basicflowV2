// handlers/buttons/registros_toggle_status.js
const db = require('../../database.js');
const generateRegistrosMenu = require('../../ui/registrosMenu.js');
// --- INÍCIO DA CORREÇÃO ---
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
// --- FIM DA CORREÇÃO ---

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

        // --- INÍCIO DA CORREÇÃO ---
        // CORREÇÃO: Usando editReply com spread e flags V2/Ephemeral
        await interaction.editReply({ 
            ...menu, 
            flags: V2_FLAG | EPHEMERAL_FLAG 
        });
        // --- FIM DA CORREÇÃO ---
    }
};