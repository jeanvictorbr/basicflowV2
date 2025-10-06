const db = require('../../database.js');
const generatePontoPremiumMenu = require('../../ui/pontoPremiumMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_ponto_set_afk_interval',
    async execute(interaction) {
        const interval = parseInt(interaction.fields.getTextInputValue('input_interval'), 10);
        if (isNaN(interval) || interval < 10) {
            return interaction.reply({ content: '❌ Valor inválido. O intervalo deve ser um número igual ou maior que 10 minutos.', ephemeral: true });
        }
        await db.query(`UPDATE guild_settings SET ponto_afk_check_interval_minutes = $1 WHERE guild_id = $2`, [interval, interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        await interaction.update({ components: generatePontoPremiumMenu(settings), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};