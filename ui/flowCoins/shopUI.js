// ui/flowCoins/shopUI.js
const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const FEATURES = require('../../config/features.js'); // Importa para o fallback

module.exports = function generateShopUI(userBalance, shopItems) {
    const embed = {
        title: '🛒 Loja de FlowCoins',
        description: `Bem-vindo à loja oficial! Troque suas moedas por benefícios premium para o seu servidor.\n\n💰 **Seu Saldo:** \`${userBalance} FC\``,
        color: 0xF1C40F, // Dourado
        thumbnail: { url: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' }, // Icone genérico de loja ou do bot
        footer: { text: 'Os itens são ativados automaticamente após a compra.' }
    };

    // Cria as opções do menu
    const options = shopItems.map(item => {
        // --- LÓGICA DE DESCRIÇÃO INTELIGENTE ---
        let description = item.description;

        // Se não tiver descrição no banco, tenta gerar uma baseada na feature
        if (!description) {
            const featureInfo = FEATURES.find(f => f.value === item.feature_key);
            if (featureInfo) {
                description = `Libera o acesso: ${featureInfo.label}`;
            } else {
                description = 'Sem descrição detalhada.';
            }
        }

        // Adiciona info de duração
        const durationText = item.duration_days > 0 ? `(${item.duration_days} dias)` : '(Permanente)';
        
        return {
            label: `${item.name} - ${item.price} FC`,
            description: `${durationText} ${description}`.substring(0, 100), // Limite do Discord
            value: item.id.toString(),
            emoji: item.emoji || '📦'
        };
    });

    const components = [];

    if (options.length > 0) {
        const select = new StringSelectMenuBuilder()
            .setCustomId('flow_buy_start_') // Handler de compra
            .setPlaceholder('Selecione um item para ver detalhes ou comprar...')
            .addOptions(options.slice(0, 25)); // Limite de 25 itens

        components.push(new ActionRowBuilder().addComponents(select));
    } else {
        embed.description += "\n\n🚫 *A loja está vazia no momento.*";
    }

    return { embeds: [embed], components };
};