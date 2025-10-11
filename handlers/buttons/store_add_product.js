// Substitua o conteúdo em: handlers/buttons/store_add_product.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'store_add_product',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_store_add_product')
            .setTitle('Adicionar Novo Produto');

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_name').setLabel("Nome do Produto").setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_desc').setLabel("Descrição").setStyle(TextInputStyle.Paragraph).setRequired(false)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_price').setLabel("Preço (Ex: 19.99)").setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_stock_type').setLabel("Tipo de Estoque ('REAL' ou 'GHOST')").setStyle(TextInputStyle.Short).setValue('GHOST').setRequired(true)
            ),
            // NOVA FILEIRA PARA CARGO E DURAÇÃO
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_role_info').setLabel("ID do Cargo e Duração (opcional)").setStyle(TextInputStyle.Short).setPlaceholder("ID-DO-CARGO, 30 (para 30 dias)").setRequired(false)
            )
        );
        
        await interaction.showModal(modal);
    }
};