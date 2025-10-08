// handlers/modals/modal_ausencia_imagem.js
const db = require('../../database.js');
const generateAusenciasMenu = require('../../ui/ausenciasMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_ausencia_imagem',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        const imageUrl = interaction.fields.getTextInputValue('input_imagem_url');
        await db.query(`UPDATE guild_settings SET ausencias_imagem_vitrine = $1 WHERE guild_id = $2`, [imageUrl, interaction.guild.id]);

        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        
        // CORRIGIDO: Passa 'interaction' como primeiro argumento
        const menu = await generateAusenciasMenu(interaction, settingsResult.rows[0]);
        
        await interaction.editReply({
            content: null,
            components: menu,
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};