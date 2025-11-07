// handlers/buttons/store_cart_cancel_confirm.js
const db = require('../../database.js');
const { EmbedBuilder } = require('discord.js'); // Importa o EmbedBuilder

module.exports = {
    customId: 'store_cart_cancel_confirm',
    async execute(interaction) {
        await interaction.deferUpdate();

        const cart = (await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        if (!cart) {
            return interaction.editReply({ content: 'Este carrinho não foi encontrado.', ephemeral: true });
        }

        // --- INÍCIO DA CORREÇÃO (LOG) ---
        try {
            const settings = (await db.query('SELECT store_log_channel_id FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
            if (settings && settings.store_log_channel_id) {
                const logChannel = await interaction.client.channels.fetch(settings.store_log_channel_id).catch(() => null);
                if (logChannel) {
                    const buyer = await interaction.client.users.fetch(cart.user_id).catch(() => ({ tag: 'Usuário Desconhecido', id: cart.user_id }));
                    
                    const logEmbed = new EmbedBuilder()
                        .setTitle('🛒 Carrinho Cancelado')
                        .setColor('Red')
                        .setDescription(`O carrinho \`${cart.channel_id}\` foi cancelado.`)
                        .addFields(
                            { name: 'Usuário', value: `${buyer.tag} (\`${buyer.id}\`)`, inline: true },
                            { name: 'Cancelado por', value: `${interaction.user.tag} (\`${interaction.user.id}\`)`, inline: true },
                            { name: 'Valor Total', value: `R$ ${cart.total_price || '0.00'}` }
                        )
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }
        } catch (logError) {
            console.error('[Store Log] Falha ao logar cancelamento de carrinho:', logError);
        }
        // --- FIM DA CORREÇÃO (LOG) ---

        // Deleta o canal do carrinho
        await interaction.channel.delete('Carrinho cancelado pelo staff.');

        // Tenta enviar DM ao usuário
        try {
            const user = await interaction.client.users.fetch(cart.user_id);
            await user.send(`Seu carrinho de compras \`#${interaction.channel.name}\` no servidor **${interaction.guild.name}** foi cancelado pela administração.`);
        } catch (dmError) {
            console.warn(`[Store] Não foi possível notificar ${cart.user_id} sobre o cancelamento do carrinho.`);
        }
    }
};