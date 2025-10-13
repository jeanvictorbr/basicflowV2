// Substitua o conteúdo em: handlers/buttons/dev_toggle_module_status_.js
const db = require('../../database.js');
const generateFeatureFlagsMenu = require('../../ui/devPanel/devFeatureFlagsMenu.js');
const { updateModuleStatusCache } = require('../../utils/moduleStatusCache.js'); // <-- NOVA IMPORTAÇÃO
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_toggle_module_status_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const moduleName = interaction.customId.split('_').slice(4).join('_');

        await db.query(
            'INSERT INTO module_status (module_name, is_enabled) VALUES ($1, true) ON CONFLICT (module_name) DO NOTHING',
            [moduleName]
        );
        
        await db.query(
            'UPDATE module_status SET is_enabled = NOT is_enabled WHERE module_name = $1',
            [moduleName]
        );

        // --- CORREÇÃO APLICADA ---
        // Chama a função importada, passando o client
        await updateModuleStatusCache(interaction.client);

        const statuses = (await db.query('SELECT * FROM module_status ORDER BY module_name ASC')).rows;
        
        // Determina a página atual para manter a visualização
        const moduleIndex = statuses.findIndex(s => s.module_name === moduleName);
        const currentPage = Math.floor(moduleIndex / 5); // 5 é o ITEMS_PER_PAGE da UI

        await interaction.editReply({
            components: generateFeatureFlagsMenu(statuses, currentPage),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};