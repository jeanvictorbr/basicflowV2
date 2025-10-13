// ui/store/vitrineMenu.js
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const PRODUCTS_PER_PAGE = 5;

// ADICIONADO A IMAGEM PADRÃO AQUI
const DEFAULT_IMAGE_URL = 'https://media.discordapp.net/attachments/1310610658844475404/1426843447217754172/E99EBFA9-97D6-422C-6AC4EEC1651A.png?ex=68ed5bc3&is=68ec0a43&hm=2641efe8640c0c67b23a3a829d4807c8cb595535df9d519838fcf65f5c747dac&=&format=webp&quality=lossless';


module.exports = function generateVitrineMenu(settings, categories = [], products = [], selectedCategoryId = null, page = 0) {
    const config = settings.store_vitrine_config || {};
    const selectedCategory = categories.find(c => c.id.toString() === selectedCategoryId);

    const embed = new EmbedBuilder()
        .setColor(config.color || '#5865F2')
        .setTitle(config.title || '🏪 Vitrine de Produtos')
        .setDescription(selectedCategory?.description || config.description || 'Selecione uma categoria para ver os produtos ou veja os itens sem categoria abaixo.');

    // LÓGICA ATUALIZADA: Usa a imagem configurada ou a padrão
    embed.setImage(config.image_url || DEFAULT_IMAGE_URL);


    const categorySelectRow = new ActionRowBuilder();
    const productSelectRow = new ActionRowBuilder();
    let paginationRow = null;

    if (settings.store_categories_enabled && categories.length > 0) {
        const categoryOptions = categories.map(c => ({
            label: c.name,
            value: c.id.toString(),
            description: c.description?.substring(0, 100) || undefined,
            default: selectedCategoryId === c.id.toString()
        }));
        categorySelectRow.addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_store_vitrine_category')
                .setPlaceholder('Navegue pelas categorias...')
                .addOptions(categoryOptions)
        );
    }
    
    const productList = Array.isArray(products) ? products : [];
    
    const productsToDisplay = settings.store_categories_enabled
        ? (selectedCategoryId
            ? productList.filter(p => p.category_id && p.category_id.toString() === selectedCategoryId)
            : productList.filter(p => !p.category_id))
        : productList;

    const totalPages = Math.ceil(productsToDisplay.length / PRODUCTS_PER_PAGE);
    const paginatedProducts = productsToDisplay.slice(page * PRODUCTS_PER_PAGE, (page + 1) * PRODUCTS_PER_PAGE);

    const productSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_store_vitrine_product')
        .setPlaceholder('Selecione um ou mais produtos...');

    if (paginatedProducts.length > 0) {
        const productOptions = paginatedProducts.map(p => ({
            label: p.name,
            description: `R$ ${parseFloat(p.price).toFixed(2)} | Estoque: ${p.stock === -1 ? 'Ilimitado' : p.stock}`,
            value: p.id.toString()
        }));
        const maxValues = Math.min(25, productOptions.length);
        productSelectMenu.addOptions(productOptions).setMinValues(1).setMaxValues(maxValues > 0 ? maxValues : 1);
    } else {
        const message = settings.store_categories_enabled ? 'Nenhum produto nesta categoria.' : 'Nenhum produto disponível.';
        productSelectMenu.addOptions([{ label: message, value: 'none' }]).setDisabled(true);
    }
    productSelectRow.addComponents(productSelectMenu);
    
    if (totalPages > 1) {
        paginationRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`store_vitrine_page_${selectedCategoryId || 'none'}_${page - 1}`).setLabel('Anterior').setStyle(ButtonStyle.Primary).setDisabled(page === 0),
            new ButtonBuilder().setCustomId(`store_vitrine_page_${selectedCategoryId || 'none'}_${page + 1}`).setLabel('Próxima').setStyle(ButtonStyle.Primary).setDisabled(page + 1 >= totalPages)
        );
    }
    
    return { embeds: [embed], components: [categorySelectRow, productSelectRow, paginationRow].filter(row => row && row.components.length > 0) };
};