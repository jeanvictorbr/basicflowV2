// Substitua o conteúdo em: ui/store/vitrineMenu.js
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = function generateVitrineMenu(settings, allProducts) {
    const config = settings.store_vitrine_config || {};

    const embed = new EmbedBuilder()
        .setColor(config.color || '#5865F2')
        .setTitle(config.title || '🏪 Vitrine de Produtos')
        .setDescription(config.description || 'Selecione um ou mais itens no menu abaixo para iniciar sua compra.');

    if (config.image_url) {
        embed.setImage(config.image_url);
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_store_vitrine_product')
        .setPlaceholder('Clique aqui para ver e selecionar nossos produtos...');

    const components = [];

    if (allProducts && allProducts.length > 0) {
        const options = allProducts.map(p => ({
            label: p.name,
            description: `R$ ${parseFloat(p.price).toFixed(2)} | Estoque: ${p.stock === -1 ? 'Ilimitado' : p.stock}`,
            value: p.id.toString(),
        }));
        selectMenu.addOptions(options)
            // A MÁGICA ACONTECE AQUI:
            .setMinValues(1) // Mínimo de 1 item
            .setMaxValues(options.length > 25 ? 25 : options.length); // Máximo de itens (limite do Discord é 25)

    } else {
        selectMenu.addOptions([{ label: 'Nenhum produto disponível no momento.', value: 'none' }]).setDisabled(true);
    }
    components.push(new ActionRowBuilder().addComponents(selectMenu));

    return { embeds: [embed], components };
};