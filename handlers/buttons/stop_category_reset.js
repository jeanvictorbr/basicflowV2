// Crie este arquivo em: handlers/buttons/stop_category_reset.js
const db = require('../../database.js');
const generateStopCategoriesMenu = require('../../ui/stopCategoriesMenu.js');

module.exports = {
    customId: 'stop_category_reset',
    async execute(interaction) {
        await interaction.deferUpdate();
        await db.query('DELETE FROM stop_categories WHERE guild_id = $1', [interaction.guild.id]);
        await interaction.editReply(generateStopCategoriesMenu([])); // Envia menu com lista vazia
        await interaction.followUp({ content: '✅ Categorias resetadas para o padrão do bot!', ephemeral: true });
    }
};