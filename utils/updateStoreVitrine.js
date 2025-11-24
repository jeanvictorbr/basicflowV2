// Substitua em: utils/updateStoreVitrine.js
const db = require('../database');
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

/**
 * Atualiza a vitrine de uma ou todas as categorias da loja.
 * @param {Client} client - Cliente do Discord.
 * @param {string} guildId - ID do servidor.
 * @param {string|null} categoryId - ID da categoria (opcional). Se nulo, atualiza todas.
 */
module.exports = async (client, guildId, categoryId = null) => {
    try {
        const guild = await client.guilds.fetch(guildId).catch(() => null);
        if (!guild) return;

        // 1. Determinar quais categorias atualizar
        let categoriesToUpdate = [];

        if (categoryId) {
            // Se passou ID, busca só essa
            const res = await db.query('SELECT * FROM store_categories WHERE id = $1', [categoryId]);
            categoriesToUpdate = res.rows;
        } else {
            // Se NÃO passou ID (uso geral), busca TODAS as categorias configuradas dessa guild
            // Filtramos apenas as que têm canal e mensagem definidos para economizar recursos
            const res = await db.query(
                'SELECT * FROM store_categories WHERE guild_id = $1 AND vitrine_channel_id IS NOT NULL AND vitrine_message_id IS NOT NULL', 
                [guildId]
            );
            categoriesToUpdate = res.rows;
        }

        if (categoriesToUpdate.length === 0) return;

        // 2. Loop de Atualização (Processa cada categoria encontrada)
        for (const catData of categoriesToUpdate) {
            try {
                // Verifica se a categoria tem configuração de vitrine válida
                if (!catData.vitrine_channel_id || !catData.vitrine_message_id) continue;

                const channel = await guild.channels.fetch(catData.vitrine_channel_id).catch(() => null);
                if (!channel) continue;

                const message = await channel.messages.fetch(catData.vitrine_message_id).catch(() => null);
                if (!message) continue;

                // 3. Buscar produtos DESSA categoria específica
                const productsResult = await db.query(
                    'SELECT * FROM store_products WHERE category_id = $1 AND is_enabled = true ORDER BY id ASC',
                    [catData.id]
                );
                const products = productsResult.rows;

                // 4. Montar o Embed da Vitrine
                const embed = new EmbedBuilder()
                    .setTitle(catData.vitrine_title || catData.name)
                    .setDescription(catData.vitrine_desc || `Confira os produtos da categoria **${catData.name}** abaixo.`)
                    .setColor(catData.vitrine_color || '#2b2d31')
                    .setFooter({ text: catData.vitrine_footer || 'Selecione um produto no menu abaixo para comprar.' });

                if (catData.vitrine_image) embed.setImage(catData.vitrine_image);
                if (catData.vitrine_thumbnail) embed.setThumbnail(catData.vitrine_thumbnail);

                // 5. Montar o Menu de Seleção (Dropdown)
                const components = [];

                if (products.length > 0) {
                    // Limite de 25 produtos por menu (limitação do Discord)
                    // Se tiver mais de 25, pega apenas os primeiros para não quebrar a vitrine
                    // (Idealmente, produtos "excedentes" deveriam ir para outra categoria ou sistema de páginas na vitrine)
                    const productsSlice = products.slice(0, 25);

                    const select = new StringSelectMenuBuilder()
                        .setCustomId(`store_vitrine_select_${catData.id}`) // ID único por categoria
                        .setPlaceholder('🛒 Selecione um produto para comprar...');

                    const options = productsSlice.map(p => {
                        let priceFormatted = "R$ 0,00";
                        try {
                            priceFormatted = parseFloat(p.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                        } catch (e) { priceFormatted = `R$ ${p.price}`; }
                        
                        let stockText;
                        if (p.stock_type === 'GHOST') {
                             stockText = '📦 Ilimitado (Entrega Ghost)';
                        } else if (p.stock === -1) {
                             stockText = '📦 Ilimitado';
                        } else {
                             stockText = `📦 Restam: ${p.stock}`;
                        }

                        return {
                            label: `${p.name.substring(0, 50)} [${priceFormatted}]`, // Nome + Preço
                            description: stockText,
                            value: `prod_${p.id}`, // Value carrega o ID do produto
                            emoji: p.emoji || '🏷️'
                        };
                    });

                    select.addOptions(options);
                    components.push(new ActionRowBuilder().addComponents(select));
                } else {
                    // Se não tiver produtos, avisa no embed e não manda menu
                    embed.addFields({ name: '🚫 Estoque Vazio', value: 'Nenhum produto disponível nesta categoria no momento.' });
                }

                // 6. Editar a mensagem existente
                await message.edit({ content: null, embeds: [embed], components: components });
                
                // Pequeno delay para evitar rate limit se houver muitas categorias
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (innerError) {
                console.error(`[Vitrine] Erro ao atualizar categoria ID ${catData.id}:`, innerError);
                // Continua para a próxima categoria mesmo se esta falhar
            }
        }

    } catch (error) {
        console.error(`[Vitrine] Erro crítico no atualizador:`, error);
    }
};