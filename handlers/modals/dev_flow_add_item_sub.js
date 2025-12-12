// handlers/modals/dev_flow_add_item_sub.js
const db = require('../../database.js');

module.exports = {
    customId: 'dev_flow_add_item_sub_', 
    async execute(interaction) {
        const featureKey = interaction.customId.split('_')[5]; 
        
        const name = interaction.fields.getTextInputValue('input_name');
        const price = parseInt(interaction.fields.getTextInputValue('input_price'));
        const duration = parseInt(interaction.fields.getTextInputValue('input_duration'));
        const emoji = interaction.fields.getTextInputValue('input_emoji') || '📦';
        // [NOVO] Pega a descrição
        const description = interaction.fields.getTextInputValue('input_desc') || null;

        if (isNaN(price) || isNaN(duration)) {
            return interaction.reply({ content: '❌ Preço e Duração devem ser números válidos.', ephemeral: true });
        }

        try {
            // [ATUALIZADO] Adicionado campo description na query
            await db.query(
                `INSERT INTO flow_shop_items (name, feature_key, price, duration_days, emoji, description, is_active) 
                 VALUES ($1, $2, $3, $4, $5, $6, true)`,
                [name, featureKey, price, duration, emoji, description]
            );

            await interaction.reply({ 
                content: `✅ **Item Criado com Sucesso!**\n\n🛒 **Nome:** ${name}\n📝 **Desc:** ${description || '*Automática*'}\n💰 **Preço:** ${price} FC`, 
                ephemeral: true 
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Erro ao salvar item no banco de dados.', ephemeral: true });
        }
    }
};