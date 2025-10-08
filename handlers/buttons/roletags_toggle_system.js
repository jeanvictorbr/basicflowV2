// handlers/buttons/roletags_toggle_system.js
const db = require('../../database.js');
const generateRoleTagsMenu = require('../../ui/roleTagsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'roletags_toggle_system',
    async execute(interaction) {
        await interaction.deferUpdate();

        // Inverte o valor booleano no banco de dados
        await db.query(
            `UPDATE guild_settings SET roletags_enabled = NOT COALESCE(roletags_enabled, false) WHERE guild_id = $1`,
            [interaction.guild.id]
        );

        // Recarrega as informações e atualiza o menu
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const tags = (await db.query('SELECT * FROM role_tags WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        
        await interaction.editReply({
            components: generateRoleTagsMenu(settings, tags),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};