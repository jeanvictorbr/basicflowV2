// ui/flowCoins/shopUI.js
const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const FEATURES = require('../../config/features.js'); 

module.exports = function generateShopUI(userBalance, shopItems) {
    // [SEGURANÇA] Se shopItems não for array, transforma em vazio para não crasar
    if (!Array.isArray(shopItems)) {
        console.error("[ShopUI] shopItems não é um array:", shopItems);
        shopItems = [];
    }

    const embed = {
        title: '🛒 Loja de FlowCoins',
        description: `Bem-vindo à loja oficial! Troque suas moedas por benefícios premium para o seu servidor.\n\n💰 **Seu Saldo:** \`${userBalance} FC\``,
        color: 0xF1C40F, // Dourado
        thumbnail: { url: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
        footer: { text: 'Os itens são ativados automaticamente após a compra.' }
    };

    const options = shopItems.map(item => {
        let description = item.description;

        // Fallback de descrição se estiver vazia
        if (!description) {
            const featureInfo = FEATURES.find(f => f.value === item.feature_key);
            if (featureInfo) {
                description = `Libera: ${featureInfo.label}`;
            } else {
                description = 'Sem descrição detalhada.';
            }
        }

        const durationText = item.duration_days > 0 ? `(${item.duration_days}d)` : '(Perm.)';
        
        return {
            label: `${item.name} - ${item.price} FC`,
            description: `${durationText} ${description}`.substring(0, 100),
            value: item.id.toString(),
            emoji: item.emoji || '📦'
        };
    });

    const components = [];

    if (options.length > 0) {
        const select = new StringSelectMenuBuilder()
            .setCustomId('flow_buy_start_') 
            .setPlaceholder('Selecione um item para comprar...')
            .addOptions(options.slice(0, 25)); 

        components.push(new ActionRowBuilder().addComponents(select));
    } else {
        embed.description += "\n\n🚫 *A loja está vazia ou em manutenção.*";
    }

    return { embeds: [embed], components };
};