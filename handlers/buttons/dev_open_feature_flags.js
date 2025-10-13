// Substitua o conteúdo em: handlers/buttons/dev_open_feature_flags.js
const db = require('../../database.js');
const generateFeatureFlagsMenu = require('../../ui/devPanel/devFeatureFlagsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_open_feature_flags',
    async execute(interaction) {
        await interaction.deferUpdate();

        const statuses = (await db.query('SELECT * FROM module_status ORDER BY module_name ASC')).rows;
        
        // Passa a página inicial (0) para a função da UI
        await interaction.editReply({
            components: generateFeatureFlagsMenu(statuses, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};