// Substitua o conteúdo em: handlers/buttons/aut_ann_edit_content_.js
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database');

module.exports = {
    customId: 'aut_ann_edit_content_',
    async execute(interaction) {
        const annId = interaction.customId.split('_').pop();
        const { rows } = await db.query('SELECT content_data FROM automations_announcements WHERE announcement_id = $1', [annId]);
        const data = rows[0]?.content_data || {};

        const modal = new ModalBuilder()
            .setCustomId(`aut_ann_edit_content_modal_${annId}`)
            .setTitle('Editar Conteúdo do Anúncio');

        const titleInput = new TextInputBuilder()
            .setCustomId('aut_ann_title')
            .setLabel('Título do Anúncio')
            .setStyle(TextInputStyle.Short)
            .setValue(data.title || 'Novo Anúncio')
            .setRequired(true);

        const messageInput = new TextInputBuilder()
            .setCustomId('aut_ann_message')
            .setLabel('Mensagem Principal')
            .setStyle(TextInputStyle.Paragraph)
            .setValue(data.message || 'Corpo da mensagem...')
            .setRequired(true);

        const colorInput = new TextInputBuilder()
            .setCustomId('aut_ann_color')
            .setLabel('Cor HEX (Opcional)')
            .setPlaceholder('Ex: #FF0000')
            .setStyle(TextInputStyle.Short)
            .setValue(data.color || '')
            .setRequired(false);

        const imageUrlInput = new TextInputBuilder()
            .setCustomId('aut_ann_image_url')
            .setLabel('URL da Imagem (Opcional)')
            .setPlaceholder('https://i.imgur.com/link.png')
            .setStyle(TextInputStyle.Short)
            .setValue(data.imageUrl || '')
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(messageInput),
            new ActionRowBuilder().addComponents(colorInput),
            new ActionRowBuilder().addComponents(imageUrlInput)
        );

        await interaction.showModal(modal);
    }
};