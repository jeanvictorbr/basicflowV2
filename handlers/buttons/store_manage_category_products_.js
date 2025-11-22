// File: handlers/buttons/store_manage_category_products_.js
const db = require('../../database.js');
const generateManageCategoryProductsMenu = require('../../ui/store/manageCategoryProductsMenu.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    customId: 'store_manage_category_products_',
    async execute(interaction) {
        
        // CORREÇÃO 1: Verifica se a interação já foi respondida/diferida antes de tentar diferir de novo.
        // Isso permite que este arquivo seja chamado por outros handlers (como o de remover/adicionar) sem quebrar.
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferUpdate();
        }

        // O ID da categoria está na última posição (ex: store_manage_category_products_15)
        const categoryId = interaction.customId.split('_').pop();

        const category = (await db.query('SELECT * FROM store_categories WHERE id = $1', [categoryId])).rows[0];
        if (!category) {
            // Se não achar, tenta enviar mensagem de erro (editReply se já diferido, reply se não)
            const msg = { content: '❌ Categoria não encontrada.', flags: EPHEMERAL_FLAG };
            return interaction.deferred ? interaction.editReply(msg) : interaction.reply(msg);
        }

        // CORREÇÃO 2: Adicionado 'price' nas consultas SQL.
        // O menu UI precisa do preço para montar a descrição (ID: X | R$ Y), senão mostra "undefined".
        const assignedProducts = (await db.query(
            'SELECT id, name, price FROM store_products WHERE guild_id = $1 AND category_id = $2', 
            [interaction.guild.id, categoryId]
        )).rows;

        const unassignedProducts = (await db.query(
            'SELECT id, name, price FROM store_products WHERE guild_id = $1 AND category_id IS NULL', 
            [interaction.guild.id]
        )).rows;
        
        // Gera o menu V2
        const menuArray = generateManageCategoryProductsMenu(category, assignedProducts, unassignedProducts);
        
        // Pega o objeto principal do array
        const payload = menuArray[0];
        
        // Adiciona as flags V2 obrigatórias
        payload.flags = V2_FLAG | EPHEMERAL_FLAG;

        await interaction.editReply(payload);
    }
};