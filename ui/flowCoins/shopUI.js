// ui/flowCoins/shopUI.js
const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const FEATURES = require('../../config/features.js'); 

module.exports = function generateShopUI(userBalance, shopItems) {
    // [SEGURANÇA] Previne erro se a lista vier nula
    if (!Array.isArray(shopItems)) {
        console.error("[ShopUI] shopItems não é um array:", shopItems);
        shopItems = [];
    }

    // Texto explicativo sobre o sistema de Farm
    const farmInfo = [
        `ℹ️ **Como conseguir FlowCoins de graça?**`,
        `Use o comando \`/daily\` a cada 24 horas para farmar.`,
        `• 🎲 **Ganho Base:** Você ganha entre **50 e 150 FC** por dia.`,
        `• 🎰 **Jackpot:** Existe **10% de chance** de duplicar o prêmio (Até 300 FC)!`,
        `• 📈 **Acumule:** Junte moedas diariamente para usar funções gratuitamente.`
    ].join('\n');

    const embed = {
        title: '🛒 Loja de FlowCoins',
        description: `Bem-vindo à loja oficial! Troque suas moedas por benefícios premium.\n\n💰 **Seu Saldo Atual:** \` ${userBalance} FC \`\n\n${farmInfo}`,
        color: 0xF1C40F, // Dourado
        thumbnail: { url: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
        footer: { text: 'Os itens são ativados automaticamente no servidor após a compra.' }
    };

    // Mapeia os itens da loja
    const options = shopItems.map(item => {
        let description = item.description;

        // Fallback se não tiver descrição
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