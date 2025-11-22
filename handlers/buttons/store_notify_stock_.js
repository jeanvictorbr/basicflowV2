// Arquivo: handlers/buttons/store_notify_stock_.js
const db = require('../../database.js');
const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'store_notify_stock_',
    execute: async (interaction) => {
        const productId = interaction.customId.split('_').pop();
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        try {
            // 1. Verifica se já existe uma notificação para este usuário neste produto
            const existing = await db.query(
                'SELECT * FROM store_stock_notifications WHERE user_id = $1 AND product_id = $2',
                [userId, productId]
            );

            if (existing.rows.length > 0) {
                // 2. Se existe, REMOVE (Desativar)
                await db.query(
                    'DELETE FROM store_stock_notifications WHERE user_id = $1 AND product_id = $2',
                    [userId, productId]
                );

                await interaction.reply({
                    content: '🔕 **Notificação Desativada.**\nVocê não será mais avisado sobre a reposição de estoque deste produto.',
                    flags: EPHEMERAL_FLAG
                });
            } else {
                // 3. Se não existe, ADICIONA (Ativar)
                await db.query(
                    'INSERT INTO store_stock_notifications (guild_id, user_id, product_id) VALUES ($1, $2, $3)',
                    [guildId, userId, productId]
                );

                await interaction.reply({
                    content: '🔔 **Notificação Ativada!**\nFique tranquilo(a), eu vou te enviar uma mensagem no privado assim que o estoque chegar! 📦',
                    flags: EPHEMERAL_FLAG
                });
            }

        } catch (error) {
            console.error('[Store Notify] Erro ao alternar notificação:', error);
            await interaction.reply({
                content: '❌ Ocorreu um erro ao processar seu pedido de notificação.',
                flags: EPHEMERAL_FLAG
            });
        }
    }
};