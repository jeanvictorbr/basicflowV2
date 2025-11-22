// File: handlers/buttons/store_customer_resend_dm_.js
const db = require('../../database.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'store_customer_resend_dm_',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const saleId = interaction.customId.split('_').pop();

        try {
            const orderResult = await db.query('SELECT * FROM store_sales_log WHERE sale_id = $1', [saleId]);
            const order = orderResult.rows[0];

            if (!order) return interaction.editReply('❌ Pedido inválido ou não encontrado.');

            const products = order.product_details || [];
            
            // Constrói a mensagem formatada
            const contentList = products.map(p => {
                let text = `📦 **${p.name}** (x${p.quantity})`;
                
                // Se houver conteúdo entregue (keys/links), mostra em bloco de código
                if (p.delivered_content && Array.isArray(p.delivered_content) && p.delivered_content.length > 0) {
                    text += `\n\`\`\`\n${p.delivered_content.join('\n')}\n\`\`\``;
                } else {
                    // Fallback para produtos antigos ou sem stock real
                    text += `\n*(Este item foi um cargo ou compra antiga sem registro de key)*`;
                }
                return text;
            });

            // Divide em chunks se for muito grande (segurança básica)
            const description = contentList.join('\n\n').substring(0, 4000);

            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle(`📦 Resgate de Pedido #${saleId}`)
                    .setDescription(`Olá! Aqui estão os produtos da sua compra de <t:${Math.floor(new Date(order.created_at).getTime() / 1000)}:f>.\n\n${description}`)
                    .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

                await interaction.user.send({ embeds: [dmEmbed] });
                await interaction.editReply('✅ **Sucesso!** O conteúdo completo do seu pedido foi enviado na sua DM.');

            } catch (dmError) {
                console.error(dmError);
                await interaction.editReply('❌ **Erro:** Não consegui te enviar mensagem no privado. Verifique se suas DMs estão abertas.');
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Erro interno ao recuperar o pedido.');
        }
    }
};