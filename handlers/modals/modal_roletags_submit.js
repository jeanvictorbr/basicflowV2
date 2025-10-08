// handlers/modals/modal_roletags_submit.js
const db = require('../../database.js');
const generateRoleTagsMenu = require('../../ui/roleTagsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_roletags_submit_',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        const roleId = interaction.customId.split('_')[3];
        const tag = interaction.fields.getTextInputValue('input_tag');

        // Lógica Upsert: Insere ou atualiza se o cargo já existir
        await db.query(
            `INSERT INTO role_tags (guild_id, role_id, tag)
             VALUES ($1, $2, $3)
             ON CONFLICT (guild_id, role_id)
             DO UPDATE SET tag = $3`,
            [interaction.guild.id, roleId, tag]
        );

        const tags = (await db.query('SELECT * FROM role_tags WHERE guild_id = $1', [interaction.guild.id])).rows;
        await interaction.editReply({
            components: generateRoleTagsMenu(tags),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};