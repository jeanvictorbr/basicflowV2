// Crie em: handlers/modals/modal_store_cats_search.js
const db = require('../../database.js');
const generateCategorySelectMenu = require('../../ui/store/categorySelectMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    // Captura 'modal_store_cats_search_edit' e '..._remove'
    customId: 'modal_store_cats_search_', 
    async execute(interaction) {
        await interaction.deferUpdate();

        // Pega o modo (edit/remove) do ID
        const mode = interaction.customId.replace('modal_store_cats_search_', '');
        const query = interaction.fields.getTextInputValue('query');

        try {
            // Busca categorias pelo nome (Case Insensitive)
            // Limitamos a 25 resultados para caber no menu sem paginação complexa de busca
            const categories = (await db.query(
                'SELECT * FROM store_categories WHERE guild_id = $1 AND name ILIKE $2 ORDER BY id ASC LIMIT 25', 
                [interaction.guild.id, `%${query}%`]
            )).rows;

            // Gera o menu com os resultados
            // Passamos: (lista, pagina 0, 1 pagina total, modo, isSearch=true, termoBuscado)
            const uiComponents = generateCategorySelectMenu(categories, 0, 1, mode, true, query);

            await interaction.editReply({
                components: uiComponents,
                flags: V2_FLAG | EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error("Erro na pesquisa de categorias:", error);
            await interaction.followUp({ content: '❌ Erro ao pesquisar.', ephemeral: true });
        }
    }
};