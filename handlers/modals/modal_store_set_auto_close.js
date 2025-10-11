// Crie em: handlers/modals/modal_store_set_auto_close.js
const db = require('../../database.js');
const generateConfigAdvancedMenu = require('../../ui/store/configAdvancedMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_store_set_auto_close',
    async execute(interaction) {
        await interaction.deferUpdate();
        const hours = parseInt(interaction.fields.getTextInputValue('input_hours'), 10);

        if (isNaN(hours) || hours < 1) {
            return interaction.followUp({ content: '❌ Por favor, insira um número válido (maior que 0).', ephemeral: true });
        }

        await db.query(
            `UPDATE guild_settings SET store_auto_close_hours = $1 WHERE guild_id = $2`,
            [hours, interaction.guild.id]
        );

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const menu = await generateConfigAdvancedMenu(interaction, settings);
        
        await interaction.editReply({
            components: menu,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
        
        await interaction.followUp({ content: '✅ Tempo de auto-fecho atualizado com sucesso!', ephemeral: true });
    }
};