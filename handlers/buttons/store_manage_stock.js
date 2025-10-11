// Crie em: handlers/buttons/store_manage_stock.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_manage_stock',
    async execute(interaction) {
        await interaction.deferUpdate();
        const products = (await db.query('SELECT id, name FROM store_products WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;

        const options = products.map(p => ({
            label: p.name,
            description: `ID do Produto: ${p.id}`,
            value: p.id.toString(),
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_store_manage_stock')
            .setPlaceholder('Selecione um produto para gerir o seu estoque real')
            .addOptions(options);

        const cancelButton = new ButtonBuilder().setCustomId('store_manage_products').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

        await interaction.editReply({
            components: [
                { type: 17, components: [{ type: 10, content: "> **Passo 1/2:** Selecione o produto para o qual deseja adicionar ou remover itens de estoque." }] },
                new ActionRowBuilder().addComponents(selectMenu), 
                new ActionRowBuilder().addComponents(cancelButton)
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};