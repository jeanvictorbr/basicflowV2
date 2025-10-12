// Crie em: handlers/buttons/store_remove_category.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_remove_category',
    async execute(interaction) {
        await interaction.deferUpdate();
        const categories = (await db.query('SELECT id, name FROM store_categories WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;

        const options = categories.map(c => ({
            label: c.name,
            description: `ID da Categoria: ${c.id}`,
            value: c.id.toString(),
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_store_remove_category')
            .setPlaceholder('Selecione a categoria para REMOVER')
            .addOptions(options);

        const cancelButton = new ButtonBuilder().setCustomId('store_manage_categories').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

        await interaction.editReply({
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};