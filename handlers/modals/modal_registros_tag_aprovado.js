// Substitua em: handlers/modals/modal_registros_tag_aprovado.js
const db = require('../../database.js');
const generateRegistrosMenu = require('../../ui/registrosMenu.js');

const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_registros_tag_aprovado',
    async execute(interaction) {
        const tag = interaction.fields.getTextInputValue('input_tag');
        await db.query(`UPDATE guild_settings SET registros_tag_aprovado = $1 WHERE guild_id = $2`, [tag, interaction.guild.id]);
        
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        
        // CORREÇÃO: Garante que um objeto vazio seja passado para a UI se as configurações não existirem.
        const menu = await generateRegistrosMenu(interaction, settingsResult.rows[0] || {});
        
        await interaction.update({ components: menu, flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};