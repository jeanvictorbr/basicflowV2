// Substitua o conteúdo em: handlers/buttons/store_cart_cancel_confirm.js
const db = require('../../database.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'store_cart_cancel_confirm',
    async execute(interaction) {
        await interaction.deferUpdate();

        const cart = (await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        if (!cart) {
             // Se o carrinho não existe mais, apenas edita a mensagem e encerra.
             return interaction.editReply({ content: 'Este carrinho já foi removido.', components: [], embeds: []});
        }

        try {
            const finalPrice = (cart.products_json || []).reduce((sum, p) => sum + parseFloat(p.price), 0);
            await db.query(
                `INSERT INTO store_sales_log (guild_id, user_id, total_amount, product_details, status) VALUES ($1, $2, $3, $4::jsonb, 'cancelled')`,
                [cart.guild_id, cart.user_id, finalPrice, JSON.stringify(cart.products_json || [])]
            );
        } catch (logError) {
            console.error('[Store] Falha ao registrar venda cancelada no log:', logError);
        }

        const finalEmbed = new EmbedBuilder().setColor('#99AAB5').setTitle('Compra Cancelada').setDescription('Seu carrinho foi esvaziado. Este canal será deletado em 10 segundos.');
        await interaction.editReply({ embeds: [finalEmbed], components: [] });
        
        setTimeout(async () => {
            try {
                const channelToDelete = await interaction.client.channels.fetch(cart.channel_id).catch(() => null);
                if (channelToDelete) await channelToDelete.delete('Carrinho cancelado.');
                await db.query('DELETE FROM store_carts WHERE channel_id = $1', [cart.channel_id]);
            } catch (error) { console.error(`[Store] Falha ao deletar canal do carrinho ${cart.channel_id}:`, error); }
        }, 10000);
    }
};