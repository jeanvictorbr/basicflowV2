const db = require('../../database.js');
const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'dev_flow_remove_item',
    async execute(interaction) {
        const items = await db.query('SELECT * FROM flow_shop_items WHERE is_active = true');

        if (items.rows.length === 0) {
            return interaction.reply({ content: "🚫 A loja está vazia.", ephemeral: true });
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId('dev_flow_remove_select')
            .setPlaceholder('Selecione o produto para remover')
            .addOptions(items.rows.map(item => ({
                label: item.name,
                value: item.id.toString(),
                description: `${item.price} FC - ${item.feature_key}`,
                emoji: item.emoji || '📦'
            })));

        await interaction.reply({
            content: "🗑️ **Qual produto deseja remover da loja?**\nIsso não afeta quem já comprou.",
            components: [new ActionRowBuilder().addComponents(select)],
            ephemeral: true
        });
    }
};