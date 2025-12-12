const db = require('../../database.js');
const getMenu = require('../../ui/devPanel/devFlowCoinsMenu.js'); // Para atualizar o painel
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'dev_flow_add_sub_',
    async execute(interaction) {
        const featureKey = interaction.customId.split('dev_flow_add_sub_')[1];
        
        const name = interaction.fields.getTextInputValue('name');
        const price = parseInt(interaction.fields.getTextInputValue('price'));
        const days = parseInt(interaction.fields.getTextInputValue('days'));
        const emoji = interaction.fields.getTextInputValue('emoji') || '📦';

        if (isNaN(price) || isNaN(days)) return interaction.reply({ content: "Preço e Dias devem ser números.", ephemeral: true });

        await db.query(`
            INSERT INTO flow_shop_items (name, feature_key, price, duration_days, emoji)
            VALUES ($1, $2, $3, $4, $5)
        `, [name, featureKey, price, days, emoji]);

        // Feedback
        await interaction.reply({
            components: [{ type: 10, content: `✅ **Produto Criado!**\n📦 ${name}\n🔑 Feature: \`${featureKey}\`\n💰 ${price} FC`, style: 1 }],
            flags: V2_FLAG,
            ephemeral: true
        });
    }
};