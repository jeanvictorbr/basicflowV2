const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');
const { getImportMenu } = require('../../ui/guildArchitect/importMenu.js'); 

// SEU ID DE DESENVOLVEDOR (Segurança)
const DEVELOPER_ID = process.env.OWNER_ID || '140867979578576916';

module.exports = {
    data: {
        name: 'blueprint-importar'
    },
    v2: V2_FLAG, 
    devOnly: true,
    execute: async (interaction, _client_arg) => {
        const client = interaction.client; 
        
        // --- 🔒 BLOQUEIO DE SEGURANÇA (DEV ONLY) ---
        if (interaction.user.id !== DEVELOPER_ID) {
            return interaction.reply({
                content: '🔒 **Acesso Negado:** Este comando é restrito ao desenvolvedor do bot.',
                flags: EPHEMERAL_FLAG
            });
        }
        // ------------------------------------------

        const user = interaction.user; 

        const { rows: blueprints } = await db.query('SELECT blueprint_id, template_name, created_at FROM guild_blueprints WHERE created_by = $1 ORDER BY created_at DESC', [user.id]);

        if (blueprints.length === 0) {
            return interaction.reply({
                content: 'ℹ️ Você não possui nenhum blueprint salvo para importar.',
                flags: EPHEMERAL_FLAG 
            });
        }

        const importMenu = getImportMenu(blueprints);
        
        return interaction.reply({
            ...importMenu,
            flags: EPHEMERAL_FLAG 
        });
    }
};