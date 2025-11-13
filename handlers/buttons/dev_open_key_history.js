const db = require('../../database.js');
const generateDevKeyHistoryMenu = require('../../ui/devPanel/devKeyHistoryMenu.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'dev_open_key_history',
    async execute(interaction) {
        try {
            await interaction.deferUpdate();

            const itemsPerPage = 5;
            const page = 0;
            const offset = 0;

            // 1. Busca histórico (Ordenado pelo mais recente)
            const historyResult = await db.query(
                'SELECT * FROM activation_key_history ORDER BY activated_at DESC LIMIT $1 OFFSET $2', 
                [itemsPerPage, offset]
            );
            
            // 2. Conta total
            const totalResult = await db.query('SELECT COUNT(*) FROM activation_key_history');
            const totalItems = parseInt(totalResult.rows[0].count, 10);
            const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

            // 3. Gera UI
            const menuV2 = generateDevKeyHistoryMenu(historyResult.rows, page, totalItems, totalPages);

            await interaction.editReply({
                components: [menuV2],
                flags: V2_FLAG | EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            const errorLayout = {
                type: 17,
                components: [
                    { type: 10, content: `❌ **Erro:** ${error.message}` },
                    { type: 1, components: [{ type: 2, style: 2, label: "Voltar", custom_id: "dev_manage_keys" }] }
                ]
            };
            await interaction.editReply({ components: [errorLayout], flags: V2_FLAG | EPHEMERAL_FLAG });
        }
    }
};