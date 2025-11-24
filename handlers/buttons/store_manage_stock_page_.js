// Substitua em: handlers/buttons/store_manage_stock_page_.js
const db = require('../../database.js');
const generateManageStockSelectMenu = require('../../ui/store/manageStockSelectMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    // O sistema captura tudo que começa com isso
    customId: 'store_manage_stock_page_',
    
    async execute(interaction) {
        try {
            // IMPORTANTE: Se já respondeu ou diferiu, não faz de novo para evitar erro
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferUpdate();
            }

            // 1. Extração Inteligente do ID
            // IDs podem vir como: "store_manage_stock_page_5", "...page_5_next", "...page_4_prev"
            // Removemos o prefixo padrão
            let cleanId = interaction.customId.replace('store_manage_stock_page_', '');
            
            // Removemos sufixos se existirem (_next, _prev) usando regex ou split
            cleanId = cleanId.split('_')[0]; 
            
            let targetPage = parseInt(cleanId);
            if (isNaN(targetPage) || targetPage < 0) targetPage = 0;

            const ITEMS_PER_PAGE = 25;
            const offset = targetPage * ITEMS_PER_PAGE;

            // 2. Query de Contagem
            const countResult = await db.query('SELECT COUNT(*) as count FROM store_products WHERE guild_id = $1', [interaction.guild.id]);
            const totalItems = parseInt(countResult.rows[0].count || 0);
            let totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
            if (totalPages < 1) totalPages = 1;

            // Validação de Limite
            if (targetPage >= totalPages) targetPage = totalPages - 1;

            // 3. Query de Produtos (Garantindo a ordem)
            const products = (await db.query(
                'SELECT id, name, price FROM store_products WHERE guild_id = $1 ORDER BY id ASC LIMIT $2 OFFSET $3', 
                [interaction.guild.id, ITEMS_PER_PAGE, offset]
            )).rows;

            // 4. Gera UI
            const uiComponents = generateManageStockSelectMenu(products, targetPage, totalPages, false);

            // 5. Atualiza a mensagem
            await interaction.editReply({
                components: uiComponents,
                flags: V2_FLAG | EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error("Erro pagination:", error);
            if (!interaction.replied) await interaction.followUp({ content: 'Erro ao mudar página.', ephemeral: true });
        }
    }
};