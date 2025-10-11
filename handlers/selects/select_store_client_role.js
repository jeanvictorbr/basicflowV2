// Crie em: handlers/selects/select_store_client_role.js
const db = require('../../database.js');
const generateConfigMenu = require('../../ui/store/configMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_store_client_role',
    async execute(interaction) {
        await interaction.deferUpdate();
        const roleId = interaction.values[0];
        await db.query(`UPDATE guild_settings SET store_client_role_id = $1 WHERE guild_id = $2`, [roleId, interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        await interaction.editReply({ components: generateConfigMenu(settings), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};