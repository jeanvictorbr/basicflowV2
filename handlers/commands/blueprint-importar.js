const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');
const { getImportMenu } = require('../../ui/guildArchitect/importMenu.js'); 

module.exports = {
    data: {
        name: 'blueprint-importar'
    },
    v2: V2_FLAG, // <-- ISTO FICA AQUI (para o index.js)
    devOnly: true,
    execute: async (interaction, _client_arg) => {
        const client = interaction.client; 
        const user = interaction.user; 

        const { rows: blueprints } = await db.query('SELECT blueprint_id, template_name, created_at FROM guild_blueprints WHERE created_by = $1 ORDER BY created_at DESC', [user.id]);

        if (blueprints.length === 0) {
            return interaction.reply({
                content: 'ℹ️ Você não possui nenhum blueprint salvo para importar.',
                flags: EPHEMERAL_FLAG // <-- CORRETO
            });
        }

        const importMenu = getImportMenu(blueprints);
        
        return interaction.reply({
            ...importMenu,
            /**
             * CORREÇÃO: Removido o 'V2_FLAG' daqui.
             * A V2_FLAG é para o handler, não para a resposta.
             */
            flags: EPHEMERAL_FLAG 
        });
    }
};