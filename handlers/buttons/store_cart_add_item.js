// Crie em: handlers/buttons/store_cart_add_item.js
const db = require('../../database.js');

module.exports = {
    customId: 'store_cart_add_item',
    async execute(interaction) {
        const settings = (await db.query('SELECT store_vitrine_channel_id FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        if (!settings || !settings.store_vitrine_channel_id) {
            return interaction.reply({ content: 'O canal da vitrine não está configurado.', ephemeral: true });
        }

        await interaction.reply({
            content: `Clique aqui para voltar à vitrine e adicionar mais itens: <#${settings.store_vitrine_channel_id}>`,
            ephemeral: true
        });
    }
};