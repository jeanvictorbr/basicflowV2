// handlers/modals/modal_store_set_mp_token.js
const db = require('../../database.js');
const generateConfigAdvancedMenu = require('../../ui/store/configAdvancedMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_store_set_mp_token',
    async execute(interaction) {
        await interaction.deferUpdate();
        const token = interaction.fields.getTextInputValue('input_mp_token');

        await db.query('UPDATE guild_settings SET store_mp_token = $1 WHERE guild_id = $2', [token, interaction.guild.id]);

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const menu = await generateConfigAdvancedMenu(interaction, settings);
        
        await interaction.editReply({
            components: menu,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
        
        await interaction.followUp({ content: '✅ Access Token do Mercado Pago salvo com sucesso!', ephemeral: true });
    }
};