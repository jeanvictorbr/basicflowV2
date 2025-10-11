// Substitua o conteúdo em: handlers/buttons/store_staff_deny_payment.js
const db = require('../../database.js');

module.exports = {
    customId: 'store_staff_deny_payment',
    async execute(interaction) {
        const cartId = interaction.channel.isThread() ? interaction.channel.parentId : interaction.channel.id;
        
        if (!cartId) { return interaction.reply({ content: '❌ Erro: Não foi possível identificar o carrinho.', ephemeral: true }); }
        
        const cart = (await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [cartId])).rows[0];
        if (!cart) { return interaction.reply({ content: '❌ Este carrinho não foi encontrado.', ephemeral: true }); }

        const settings = (await db.query('SELECT store_staff_role_id FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        if (!interaction.member.roles.cache.has(settings.store_staff_role_id)) {
            return interaction.reply({ content: '❌ Você não tem permissão para recusar pagamentos.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });
        
        const buyer = await interaction.guild.members.fetch(cart.user_id).catch(() => null);
        if (buyer) {
            await buyer.send(`Olá! Infelizmente, sua compra no servidor **${interaction.guild.name}** foi cancelada pela nossa equipe. Se tiver dúvidas, abra um novo carrinho.`).catch(() => {});
        }

        await interaction.editReply('✅ A compra foi cancelada. Este canal será excluído em 10 segundos.');

        // --- LÓGICA DE EXCLUSÃO DE CANAL E THREAD ---
        setTimeout(async () => {
            try {
                const anchorChannel = await interaction.guild.channels.fetch(cart.channel_id).catch(() => null);
                if (anchorChannel) {
                    await anchorChannel.delete('Venda cancelada pelo staff.');
                }
                await db.query('DELETE FROM store_carts WHERE channel_id = $1', [cart.channel_id]);
            } catch (deleteError) {
                console.error(`[Store] Falha ao deletar canal/thread ${cart.channel_id}:`, deleteError);
            }
        }, 10000);
    }
};