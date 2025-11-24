// Crie em: handlers/buttons/store_stock_pg_.js
const db = require('../../database.js');
const generateManageStockSelectMenu = require('../../ui/store/manageStockSelectMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    // ID curto e novo para evitar conflitos antigos
    customId: 'store_stock_pg_',
    
    async execute(interaction) {
        try {
            // Usamos update para evitar piscar/criar nova msg
            // deferUpdate não é necessário se fizermos update direto, mas por segurança:
            // await interaction.deferUpdate(); 
            // NOTA: Ao usar update() direto, não use deferUpdate antes.

            // 1. Extrair Página
            // ID é "store_stock_pg_5" -> pega o "5"
            const pageStr = interaction.customId.replace('store_stock_pg_', '');
            let targetPage = parseInt(pageStr);

            if (isNaN(targetPage) || targetPage < 0) targetPage = 0;

            const ITEMS_PER_PAGE = 25;
            const offset = targetPage * ITEMS_PER_PAGE;

            // 2. Dados do Banco
            const countResult = await db.query('SELECT COUNT(*) as count FROM store_products WHERE guild_id = $1', [interaction.guild.id]);
            const totalItems = parseInt(countResult.rows[0].count || 0);
            let totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
            if (totalPages < 1) totalPages = 1;

            // 3. Validação
            if (targetPage >= totalPages) targetPage = totalPages - 1;

            // 4. Buscar Produtos (Offset calculado)
            const products = (await db.query(
                'SELECT id, name, price FROM store_products WHERE guild_id = $1 ORDER BY id ASC LIMIT $2 OFFSET $3', 
                [interaction.guild.id, ITEMS_PER_PAGE, offset]
            )).rows;

            // 5. Gerar UI e Atualizar
            const uiComponents = generateManageStockSelectMenu(products, targetPage, totalPages, false);

            await interaction.update({
                components: uiComponents
            });

        } catch (error) {
            console.error("Erro paginação:", error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'Erro ao mudar página.', ephemeral: true });
            }
        }
    }
};