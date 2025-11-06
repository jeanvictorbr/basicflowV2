// handlers/buttons/dev_keys_page.js
const db = require('../../database.js');
const generateDevKeysMenu = require('../../ui/devPanel/devKeysMenu.js');
// REMOVIDO: V2_FLAG

module.exports = {
    customId: 'dev_keys_page_',
    async execute(interaction) {
        try {
            // CORREÇÃO: Defer Legacy
            await interaction.deferUpdate({ ephemeral: true });

            const page = parseInt(interaction.customId.split('_')[3], 10);
            
            if (isNaN(page) || page < 0) {
                // Tenta recarregar a home (página 0)
                return require('./dev_manage_keys.js').execute(interaction);
            }

            const itemsPerPage = 10;
            const offset = page * itemsPerPage;

            // 1. Handler busca os dados
            const keysResult = await db.query('SELECT * FROM activation_keys WHERE uses_left > 0 ORDER BY key ASC LIMIT $1 OFFSET $2', [itemsPerPage, offset]);
            const keys = keysResult.rows;

            const totalKeysResult = await db.query('SELECT COUNT(*) FROM activation_keys WHERE uses_left > 0');
            const totalKeys = parseInt(totalKeysResult.rows[0].count, 10);
            const totalPages = Math.ceil(totalKeys / itemsPerPage) || 1;
            
            // 2. UI (Legacy) formata os dados
            const menu = generateDevKeysMenu(keys, page, totalKeys, totalPages);
            
            // 3. Handler envia a resposta (Legacy)
            menu.ephemeral = true;
            
            await interaction.editReply(menu);

        } catch (error) {
            console.error("Erro ao paginar dev_keys:", error);
            try {
                await interaction.editReply({ 
                    content: 'Erro ao carregar página.',
                    embeds: [],
                    components: [],
                    ephemeral: true
                });
            } catch (e) {
                console.error("Erro ao enviar msg de erro de paginação:", e);
            }
        }
    }
};