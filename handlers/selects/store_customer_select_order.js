// File: handlers/selects/store_customer_select_order.js
const db = require('../../database.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'store_customer_select_order',
    async execute(interaction) {
        // Responde com uma nova mensagem efêmera (V1 - Embed) para mostrar detalhes
        // Isso permite usar Embeds bonitos para os detalhes do produto
        await interaction.deferReply({ ephemeral: true });

        const saleId = interaction.values[0].replace('order_', '');
        
        try {
            const orderResult = await db.query(
                'SELECT * FROM store_sales_log WHERE sale_id = $1 AND user_id = $2', 
                [saleId, interaction.user.id]
            );
            const order = orderResult.rows[0];

            if (!order) {
                return interaction.editReply({ content: '❌ Pedido não encontrado.' });
            }

            const products = order.product_details || [];
            const productDesc = products.map(p => `📦 **${p.name}**\n📄 ${p.description || 'Sem descrição'}`).join('\n\n');

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle(`🧾 Detalhes do Pedido #${order.sale_id}`)
                .setDescription(`**Realizado em:** <t:${Math.floor(new Date(order.created_at).getTime() / 1000)}:f>\n**Valor Total:** R$ ${order.total_amount}`)
                .addFields({ name: 'Produtos Comprados', value: productDesc || 'Nenhum produto listado.' })
                .setFooter({ text: 'Clique abaixo para receber os produtos na sua DM novamente.' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`store_customer_resend_dm_${order.sale_id}`)
                    .setLabel('📩 Reenviar Produto na DM')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📤')
            );

            await interaction.editReply({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error('Erro ao buscar detalhes do pedido:', error);
            await interaction.editReply('❌ Erro ao carregar detalhes.');
        }
    }
};