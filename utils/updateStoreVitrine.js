// Arquivo: utils/updateStoreVitrine.js
const db = require('../database');
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

module.exports = async (client, guildId, categoryId = null) => {
    try {
        const guild = await client.guilds.fetch(guildId).catch(() => null);
        if (!guild) return;

        // Apenas para vitrine de categoria específica (que tem mensagem persistente)
        if (categoryId) {
            const categoryResult = await db.query('SELECT * FROM store_categories WHERE id = $1', [categoryId]);
            if (categoryResult.rows.length === 0) return;
            const catData = categoryResult.rows[0];

            if (!catData.vitrine_channel_id || !catData.vitrine_message_id) return;

            const channel = await guild.channels.fetch(catData.vitrine_channel_id).catch(() => null);
            if (!channel) return;

            const message = await channel.messages.fetch(catData.vitrine_message_id).catch(() => null);
            if (!message) return;

            // Pega produtos
            const productsResult = await db.query(
                'SELECT * FROM store_products WHERE category_id = $1 AND is_enabled = true ORDER BY id ASC',
                [categoryId]
            );
            const products = productsResult.rows;

            // Monta Embed
            const embed = new EmbedBuilder()
                .setTitle(catData.vitrine_title || catData.name)
                .setDescription(catData.vitrine_desc || `Confira os produtos da categoria **${catData.name}** abaixo.`)
                .setColor(catData.vitrine_color || '#2b2d31')
                .setFooter({ text: 'Selecione um produto no menu abaixo para comprar.' });

            if (catData.vitrine_image) embed.setImage(catData.vitrine_image);
            if (catData.vitrine_thumbnail) embed.setThumbnail(catData.vitrine_thumbnail);

            // Monta Menu
            const components = [];

            if (products.length > 0) {
                const select = new StringSelectMenuBuilder()
                    .setCustomId(`store_vitrine_select_${categoryId}`) // ID Dinâmico correto
                    .setPlaceholder('🛒 Selecione um produto...');

                const options = products.slice(0, 25).map(p => {
                    const price = parseFloat(p.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    
                    let stockText;
                    if (p.stock_type === 'GHOST') {
                         stockText = '📦 Estoque: Ilimitado (Ghost)';
                    } else if (p.stock === -1) {
                         stockText = '📦 Estoque: Ilimitado';
                    } else {
                         stockText = `📦 Restam: ${p.stock} unidades`;
                    }

                    return {
                        label: `${p.name} [${price}]`, // Nome e Preço no Título
                        description: stockText,          // Apenas Estoque na Descrição
                        value: `prod_${p.id}`,
                        emoji: p.emoji || '🏷️'
                    };
                });

                select.addOptions(options);
                components.push(new ActionRowBuilder().addComponents(select));
            } else {
                embed.addFields({ name: '🚫 Estoque', value: 'Sem produtos no momento.' });
            }

            await message.edit({ content: null, embeds: [embed], components: components });
        }

    } catch (error) {
        console.error(`[Vitrine] Erro ao atualizar categoria ${categoryId}:`, error);
    }
};