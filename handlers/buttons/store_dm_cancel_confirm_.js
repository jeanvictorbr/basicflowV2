// Substitua o conteúdo em: handlers/buttons/store_dm_cancel_confirm_.js
const db = require('../../database.js');

module.exports = {
    customId: 'store_dm_cancel_confirm_',
    async execute(interaction) {
        // Usa deferUpdate pois a resposta final será a deleção da mensagem
        await interaction.deferUpdate();
        const [, , , , guildId, cartId] = interaction.customId.split('_');

        const cart = (await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [cartId])).rows[0];
        if (!cart) return;

        // --- LÓGICA DE EXCLUSÃO APRIMORADA ---
        try {
            const guild = await interaction.client.guilds.fetch(guildId);
            const anchorChannel = await guild.channels.fetch(cart.channel_id).catch(() => null);
            if (anchorChannel) {
                // A thread já está dentro do canal, então ao deletar o canal, a thread também se vai.
                await anchorChannel.delete('Carrinho cancelado pelo usuário via DM.');
            }
            // Deleta o registro do banco de dados
            await db.query('DELETE FROM store_carts WHERE channel_id = $1', [cartId]);
        } catch (error) { 
            console.error(`[Store] Falha ao deletar canal âncora ${cartId} após cancelamento do usuário:`, error); 
        }

        // Limpa a mensagem na DM
        await interaction.editReply({ content: 'Sua compra foi cancelada com sucesso. Esta mensagem será apagada.', components: [] });
        setTimeout(async () => {
            await interaction.deleteReply().catch(()=>{});
        }, 5000);
    }
};