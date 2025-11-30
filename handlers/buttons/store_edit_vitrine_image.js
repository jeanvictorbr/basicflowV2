const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'store_edit_vitrine_image',
    async execute(interaction) {
        const res = await db.query('SELECT store_vitrine_config FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        const settings = res.rows[0] || {};
        const config = settings.store_vitrine_config || {};

        const modal = new ModalBuilder()
            .setCustomId('store_edit_vitrine_image_modal')
            .setTitle('Editar Imagem da Vitrine');

        const imageInput = new TextInputBuilder()
            .setCustomId('store_vitrine_image_input')
            .setLabel("URL da Imagem (Thumbnail)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("https://...")
            .setRequired(false);

        // Preenche APENAS se houver valor salvo
        if (config.image) {
            imageInput.setValue(config.image);
        }

        const firstActionRow = new ActionRowBuilder().addComponents(imageInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
    }
};