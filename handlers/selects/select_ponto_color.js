const db = require('../../database.js');
const generatePontoPremiumMenu = require('../../ui/pontoPremiumMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_ponto_color',
    async execute(interaction) {
        const color = interaction.values[0];
        await db.query(`UPDATE guild_settings SET ponto_vitrine_color = $1 WHERE guild_id = $2`, [color, interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        await interaction.update({ components: generatePontoPremiumMenu(settings), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};