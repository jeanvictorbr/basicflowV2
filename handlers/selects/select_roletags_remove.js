// handlers/selects/select_roletags_remove.js
const db = require('../../database.js');
const generateRoleTagsMenu = require('../../ui/roleTagsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_roletags_remove',
    async execute(interaction) {
        await interaction.deferUpdate();
        const tagId = interaction.values[0];

        await db.query('DELETE FROM role_tags WHERE id = $1 AND guild_id = $2', [tagId, interaction.guild.id]);

        // --- CORREÇÃO APLICADA AQUI ---
        // 1. Busca tanto as configurações quanto a nova lista de tags.
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const tags = (await db.query('SELECT * FROM role_tags WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        
        // 2. Passa ambos os parâmetros para a função da UI, garantindo a renderização correta.
        await interaction.editReply({
            components: generateRoleTagsMenu(settings, tags),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};