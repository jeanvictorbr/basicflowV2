// Substitua completamente o conteúdo de: ui/store/paymentMenu.js

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const hasFeature = require('../../utils/featureCheck.js');
// Importa o utilitário necessário
const { getCartSummary } = require('./dmConversationalFlow.js'); // << IMPORT CORRETA

// CRÍTICO: Função AGORA recebe a guilda para checagem de feature e lógica de sumário.
module.exports = async function generatePaymentMenu(cart, settings, coupon, guild) {
    // Adicionamos uma checagem de segurança, embora o handler de chamada deva garantir isso.
    if (!guild || !guild.id) {
        throw new Error("Objeto Guild inválido passado para generatePaymentMenu.");
    }
    
    // Agora usa guild.id (e não guild, que pode ser undefined se o handler for chamado incorretamente)
    const hasAutomation = await hasFeature(guild.id, 'STORE_AUTOMATION'); 
    
    const manualPayEnabled = settings.store_pix_key ? true : false;
    
    // Usa a função importada corretamente
    const { priceString } = getCartSummary(cart, coupon); 

    const embed = new EmbedBuilder()
        .setColor('#F1C40F')
        .setTitle('💰 Finalizar Compra: Seleção de Pagamento')
        .setDescription(`**Total a Pagar:** ${priceString}`)
        .setFooter({ text: 'Selecione uma opção de pagamento abaixo.'})
        .setTimestamp();
        
    const buttons = new ActionRowBuilder();

    // Opção de Pagamento Automático (Mercado Pago)
    if (hasAutomation && settings.store_mp_token) {
        embed.addFields({ name: 'Opção 1: PIX Automático (Recomendado)', value: 'Pague e receba instantaneamente.' });
        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId('store_pay_mercado_pago') // Formato curto
                .setLabel('PIX Automático')
                .setStyle(ButtonStyle.Success)
                .setDisabled(false)
        );
    }

    // Opção de Pagamento Manual (PIX com Comprovante)
    if (manualPayEnabled) {
        embed.addFields({ name: 'Opção 2: PIX Manual', value: 'Pague e aguarde a aprovação da Staff.' });
        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId('store_pay_manual')
                .setLabel('PIX Manual')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false)
        );
    }
    
    buttons.addComponents(
        new ButtonBuilder()
            .setCustomId('store_cart_cancel')
            .setLabel('Cancelar Compra')
            .setStyle(ButtonStyle.Danger)
    );

    return { embeds: [embed], components: [buttons] };
};