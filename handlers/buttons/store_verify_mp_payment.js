// Substitua o conteúdo em: handlers/buttons/store_verify_mp_payment.js
const { approvePurchase } = require('../../utils/approvePurchase.js');
const { getPaymentStatus } = require('../../utils/mercadoPago.js');
const db = require('../../database.js');

module.exports = {
    customId: 'store_verify_mp_payment_',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const parts = interaction.customId.split('_');
        let guildId = interaction.guild?.id; // Pega o ID da guild como padrão
        let paymentId = null;

        // --- LÓGICA DE EXTRAÇÃO CORRIGIDA ---

        // FLUXO PADRÃO (Canal): store_verify_mp_payment_PAYMENTID
        // split -> ['store', 'verify', 'mp', 'payment', 'PAYMENTID'] -> length = 5
        if (parts.length === 5) {
            paymentId = parts[4]; // Índice correto
        } 
        // FLUXO DM: store_verify_mp_payment_GUILDID_PAYMENTID
        // split -> ['store', 'verify', 'mp', 'payment', 'GUILDID', 'PAYMENTID'] -> length = 6
        else if (parts.length === 6) {
            paymentId = parts[5]; // Índice correto
            guildId = parts[4];   // Índice correto
        }

        // Validação de segurança
        if (!paymentId || paymentId.includes('FAIL')) {
            return interaction.editReply({
                content: '❌ **Erro de Extração de ID!** As informações de pagamento do botão estão incompletas ou danificadas. Por favor, gere um novo QR Code. [Cód: VMP-502]'
            });
        }
        
        try {
            // Executa a verificação com os IDs corretos
            const paymentInfo = await getPaymentStatus(guildId, paymentId);
            const cartId = paymentInfo.external_reference;

            if (paymentInfo.status === 'approved') {
                await interaction.editReply({ content: '✅ Pagamento confirmado! Iniciando a entrega dos seus produtos...' });
                await approvePurchase(interaction.client, guildId, cartId);
            } else if (paymentInfo.status === 'pending') {
                await interaction.editReply({ content: '⏳ Seu pagamento ainda está pendente. Por favor, aguarde alguns instantes após pagar e tente novamente.' });
            } else {
                 await interaction.editReply({ content: `❌ Seu pagamento foi **${paymentInfo.status}**. Por favor, gere um novo QR Code para tentar novamente.` });
                 // Limpa o ID de pagamento do carrinho para evitar conflitos
                 await db.query("UPDATE store_carts SET payment_id = NULL WHERE payment_id = $1", [paymentId]);
            }
        } catch (error) {
            console.error(`[MP Verify Fail] Guild: ${guildId}, Payment: ${paymentId}`, error);
            let errorMessage = 'Ocorreu um erro desconhecido.';
            if (error.message.includes('não está configurado')) {
                 errorMessage = "O token do Mercado Pago está configurado incorretamente. Contacte um administrador.";
            } else if (error.message.includes('Falha ao buscar informações')) {
                 errorMessage = "Não foi possível conectar com a API do Mercado Pago. Tente novamente em alguns instantes.";
            }
            
            await interaction.editReply({ content: `❌ Ocorreu um erro ao verificar seu pagamento: ${errorMessage}` });
        }
    }
};