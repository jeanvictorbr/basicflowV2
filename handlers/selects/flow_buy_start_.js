// Crie/Mova este arquivo para: handlers/selects/flow_buy_start_.js
const db = require('../../database.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'flow_buy_start_', // Captura o ID do menu da loja
    async execute(interaction) {
        // O valor selecionado é o ID do produto
        const productId = interaction.values[0];
        const userId = interaction.user.id;

        await interaction.deferReply({ ephemeral: true });

        try {
            // 1. Busca o produto e o saldo do usuário
            const product = (await db.query('SELECT * FROM flow_shop_items WHERE id = $1', [productId])).rows[0];
            const user = (await db.query('SELECT balance FROM flow_users WHERE user_id = $1', [userId])).rows[0];
            
            const balance = parseInt(user?.balance || 0);
            const price = parseInt(product.price);

            if (!product) {
                return interaction.editReply('❌ Produto não encontrado ou removido.');
            }

            // 2. Verificação de Saldo
            if (balance < price) {
                const missing = price - balance;
                return interaction.editReply({
                    content: `❌ **Saldo Insuficiente!**\n\n💰 Você tem: \`${balance} FC\`\n🏷️ Preço: \`${price} FC\`\n📉 Faltam: \`${missing} FC\`\n\nUse \`/daily\` para ganhar mais ou compre moedas.`
                });
            }

            // 3. Mostra Confirmação (Se tiver saldo)
            const confirmEmbed = new EmbedBuilder()
                .setTitle('Confirmar Compra')
                .setDescription(`Você está prestes a comprar:\n\n📦 **${product.name}**\n💰 **Preço:** ${price} FC\n📅 **Duração:** ${product.duration_days} dias\n\nSeu saldo atual: \`${balance} FC\`\nSaldo após compra: \`${balance - price} FC\``)
                .setColor('Yellow');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`flow_buy_confirm_${productId}`) // Manda pro botão de confirmar
                    .setLabel('Confirmar Compra')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅'),
                new ButtonBuilder()
                    .setCustomId('delete_ephemeral_reply')
                    .setLabel('Cancelar')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.editReply({ embeds: [confirmEmbed], components: [row] });

        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Erro ao processar seleção.');
        }
    }
};