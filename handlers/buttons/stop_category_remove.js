// Crie este arquivo em: handlers/buttons/stop_category_remove.js
const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const db = require('../../database.js');
const generateStopCategoriesMenu = require('../../ui/stopCategoriesMenu.js');

module.exports = {
    customId: 'stop_category_remove',
    async execute(interaction) {
        await interaction.deferUpdate();
        const categories = (await db.query('SELECT * FROM stop_categories WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;

        if (categories.length === 0) {
            await interaction.editReply(generateStopCategoriesMenu(categories));
            return interaction.followUp({ content: 'Não há categorias personalizadas para remover.', ephemeral: true });
        }

        const options = categories.map(cat => ({
            label: cat.name,
            value: cat.id.toString()
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_stop_category_remove')
            .setPlaceholder('Selecione a categoria para remover')
            .addOptions(options);

        await interaction.editReply({ components: [new ActionRowBuilder().addComponents(selectMenu)] });
    }
};