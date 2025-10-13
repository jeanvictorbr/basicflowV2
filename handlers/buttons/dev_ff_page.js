// Garanta que o conteúdo deste arquivo (com o novo nome) esteja assim:
const db = require('../../database.js');
const generateFeatureFlagsMenu = require('../../ui/devPanel/devFeatureFlagsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_ff_page_', // Este customId corresponde ao nome do arquivo
    async execute(interaction) {
        await interaction.deferUpdate();

        const page = parseInt(interaction.customId.split('_')[3], 10);
        if (isNaN(page)) return;

        const statuses = (await db.query('SELECT * FROM module_status ORDER BY module_name ASC')).rows;
        
        await interaction.editReply({
            components: generateFeatureFlagsMenu(statuses, page),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};