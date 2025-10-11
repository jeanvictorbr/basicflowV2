// Crie em: handlers/modals/modal_store_set_pix_key.js
const db = require('../../database.js');
const generateConfigMenu = require('../../ui/store/configMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_store_set_pix_key',
    async execute(interaction) {
        await interaction.deferUpdate();
        const pixKey = interaction.fields.getTextInputValue('input_pix_key');
        
        await db.query(`UPDATE guild_settings SET store_pix_key = $1 WHERE guild_id = $2`, [pixKey, interaction.guild.id]);
        
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        await interaction.editReply({
            components: generateConfigMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
        
        await interaction.followUp({ content: '✅ Chave PIX definida com sucesso!', ephemeral: true });
    }
};