// handlers/modals/dev_flow_add_item_sub.js
const db = require('../../database.js');

module.exports = {
    customId: 'dev_flow_add_item_sub_', // Dinâmico
    async execute(interaction) {
        // Recupera a feature key do ID do modal
        const featureKey = interaction.customId.split('_')[5]; // dev_flow_add_item_sub_KEY
        
        const name = interaction.fields.getTextInputValue('input_name');
        const price = parseInt(interaction.fields.getTextInputValue('input_price'));
        const duration = parseInt(interaction.fields.getTextInputValue('input_duration'));
        const emoji = interaction.fields.getTextInputValue('input_emoji') || '📦';

        if (isNaN(price) || isNaN(duration)) {
            return interaction.reply({ content: '❌ Preço e Duração devem ser números válidos.', ephemeral: true });
        }

        try {
            await db.query(
                `INSERT INTO flow_shop_items (name, feature_key, price, duration_days, emoji, is_active) 
                 VALUES ($1, $2, $3, $4, $5, true)`,
                [name, featureKey, price, duration, emoji]
            );

            await interaction.reply({ 
                content: `✅ **Item Criado com Sucesso!**\n\n🛒 **Nome:** ${name}\n🔑 **Feature:** \`${featureKey}\`\n💰 **Preço:** ${price} FC\n📅 **Duração:** ${duration} dias\n\nEle já deve aparecer no comando \`/loja-flow\`.`, 
                ephemeral: true 
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Erro ao salvar item no banco de dados.', ephemeral: true });
        }
    }
};