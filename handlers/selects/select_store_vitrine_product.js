// Substitua o conteúdo em: handlers/selects/select_store_vitrine_product.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const generateVitrineMenu = require('../../ui/store/vitrineMenu.js');

module.exports = {
    customId: 'select_store_vitrine_product',
    async execute(interaction) {
        const productIds = interaction.values; 

        if (productIds.length === 0) {
            return interaction.reply({ content: 'Você não selecionou nenhum produto.', ephemeral: true });
        }

        const products = (await db.query(`SELECT id, name, price FROM store_products WHERE id = ANY($1::int[])`, [productIds])).rows;

        if (products.length !== productIds.length) {
            return interaction.reply({ content: 'Um ou mais produtos selecionados não foram encontrados ou estão indisponíveis.', ephemeral: true });
        }

        const productList = products.map(p => `> • **${p.name}** - \`R$ ${parseFloat(p.price).toFixed(2)}\``).join('\n');
        const totalPrice = products.reduce((sum, p) => sum + parseFloat(p.price), 0);
        const idsString = productIds.join('-'); 

        const confirmationMessage = `### Confirme sua seleção\nVocê deseja comprar os seguintes itens?\n\n${productList}\n\n**Total:** \`R$ ${totalPrice.toFixed(2)}\`\n\n*Para cancelar, apenas ignore esta mensagem.*`;

        // BOTÃO DE CUPOM REMOVIDO DAQUI
        const actionButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`store_confirm_purchase_products_${idsString}_coupon_none`)
                .setLabel('Confirmar e Iniciar Compra')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🛒')
        );
        
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const allProducts = (await db.query('SELECT * FROM store_products WHERE guild_id = $1 AND is_enabled = true ORDER BY name ASC', [interaction.guild.id])).rows;
        const originalVitrinePayload = generateVitrineMenu(settings, allProducts);
        await interaction.update(originalVitrinePayload);

        await interaction.followUp({
            content: confirmationMessage,
            components: [actionButtons],
            ephemeral: true
        });
    }
};