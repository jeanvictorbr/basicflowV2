// Crie em: handlers/buttons/store_cart_remove_item.js
const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'store_cart_remove_item',
    async execute(interaction) {
        const cart = (await db.query('SELECT products_json FROM store_carts WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        const products = cart.products_json || [];

        if (products.length === 0) {
            return interaction.reply({ content: 'Seu carrinho já está vazio.', ephemeral: true });
        }

        const options = products.map((product, index) => ({
            label: product.name,
            description: `Preço: R$ ${parseFloat(product.price).toFixed(2)}`,
            value: `${index}`, // Usamos o índice do array como valor
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_store_cart_remove_product')
            .setPlaceholder('Selecione um item para remover do carrinho')
            .addOptions(options);

        await interaction.reply({
            content: 'Qual item você deseja remover?',
            components: [new ActionRowBuilder().addComponents(selectMenu)],
            ephemeral: true,
        });
    }
};