// Crie em: handlers/buttons/store_edit_vitrine_image.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'store_edit_vitrine_image',
    async execute(interaction) {
        const settings = (await db.query('SELECT store_vitrine_config FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const currentImage = settings.store_vitrine_config?.image_url || '';

        const modal = new ModalBuilder()
            .setCustomId('modal_store_edit_vitrine_image')
            .setTitle('Alterar Imagem da Vitrine');

        const imageInput = new TextInputBuilder()
            .setCustomId('input_image_url')
            .setLabel("URL da Imagem (link direto)")
            .setStyle(TextInputStyle.Short)
            .setValue(currentImage)
            .setPlaceholder('https://i.imgur.com/sua-imagem.png')
            .setRequired(false);

        modal.addComponents(new ActionRowBuilder().addComponents(imageInput));
        await interaction.showModal(modal);
    }
};