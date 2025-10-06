// Crie em: handlers/modals/modal_autoclose_set_hours.js
const db = require('../../database.js');
const generateAutoCloseMenu = require('../../ui/ticketsAutoCloseMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_autoclose_set_hours',
    async execute(interaction) {
        const hours = parseInt(interaction.fields.getTextInputValue('input_hours'), 10);
        if (isNaN(hours) || hours < 1 || hours > 720) {
            return interaction.reply({ content: '❌ Valor inválido. O tempo deve ser um número entre 1 e 720 horas.', ephemeral: true });
        }
        await interaction.deferUpdate();
        await db.query(`UPDATE guild_settings SET tickets_autoclose_hours = $1 WHERE guild_id = $2`, [hours, interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        await interaction.editReply({
            components: generateAutoCloseMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};