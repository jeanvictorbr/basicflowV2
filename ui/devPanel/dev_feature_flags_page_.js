// Crie este novo arquivo em: handlers/buttons/dev_feature_flags_page_.js
const db = require('../../database.js');
const generateFeatureFlagsMenu = require('../../ui/devPanel/devFeatureFlagsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_feature_flags_page_',
    async execute(interaction) {
        await interaction.deferUpdate();

        const page = parseInt(interaction.customId.split('_')[4], 10);
        if (isNaN(page)) return;

        const statuses = (await db.query('SELECT * FROM module_status ORDER BY module_name ASC')).rows;
        
        await interaction.editReply({
            components: generateFeatureFlagsMenu(statuses, page),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};