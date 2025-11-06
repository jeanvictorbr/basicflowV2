// handlers/selects/select_registros_cargo_aprovado.js
const db = require('../../database.js');
const generateRegistrosMenu = require('../../ui/registrosMenu.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    customId: 'select_registros_cargo_aprovado',
    async execute(interaction) {
        await interaction.deferUpdate();

        const roleId = interaction.values[0];
        
        await db.query(
            `UPDATE guild_settings SET registros_cargo_aprovado = $1 WHERE guild_id = $2`, 
            [roleId, interaction.guild.id]
        );

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const menuPayload = await generateRegistrosMenu(interaction, settings);
        
        // --- CORREÇÃO AQUI ---
        // Troca de .update() para .editReply()
        await interaction.editReply({ 
            ...menuPayload, 
            flags: V2_FLAG | EPHEMERAL_FLAG 
        });
        // --- FIM DA CORREÇÃO ---

        await interaction.followUp({ content: `✅ Cargo de aprovado definido para <@&${roleId}>.`, ephemeral: true });
    }
};