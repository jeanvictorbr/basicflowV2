const { ModalBuilder, ActionRowBuilder, TextInputBuilder } = require('discord.js');
const { getAnnouncementModal } = require('../../ui/announcementModal');
const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
	customId: 'anuncio_edit_', 
	async execute(interaction, client, db) {
        const guild = interaction.guild;
		const channelId = interaction.customId.split('_').pop(); 
        
        // 1. Recupera os dados atuais da Embed de pré-visualização
        const currentEmbed = interaction.message.embeds[0] || {};
        let footerText = '';

        // 2. Extrai o rodapé customizado, ignorando o rodapé de autoria
        if (currentEmbed.footer && currentEmbed.footer.text) {
            // Remove o " • Anúncio por: ..." se existir
            footerText = currentEmbed.footer.text.split(' • Anúncio por:')[0];
        }

        const currentData = {
            title: currentEmbed.title || '',
            content: currentEmbed.description || '',
            image: currentEmbed.image ? currentEmbed.image.url : '',
            thumbnail: currentEmbed.thumbnail ? currentEmbed.thumbnail.url : '',
            footerText: footerText,
        };

		// 3. Define o ID do Modal e obtém a estrutura base
		const modalCustomId = `modal_anunciar_submit_${channelId}`;
        const modalStructure = getAnnouncementModal(modalCustomId);

        // 4. Constrói o Modal usando Builders, preenchendo com os dados existentes
        const modal = new ModalBuilder()
            .setCustomId(modalCustomId)
            .setTitle(modalStructure.title);

        modalStructure.components.forEach(actionRowData => {
            const actionRow = new ActionRowBuilder();
            actionRowData.components.forEach(componentData => {
                const customId = componentData.custom_id;
                let currentValue = '';

                // Mapeia os dados existentes para os campos do modal
                switch (customId) {
                    case 'announcement_title':
                        currentValue = currentData.title;
                        break;
                    case 'announcement_content':
                        currentValue = currentData.content;
                        break;
                    case 'announcement_image_url':
                        currentValue = currentData.image;
                        break;
                    case 'announcement_thumbnail_url':
                        currentValue = currentData.thumbnail;
                        break;
                    case 'announcement_footer_text':
                        currentValue = currentData.footerText;
                        break;
                }
                
                const textInput = new TextInputBuilder()
                    .setCustomId(customId)
                    .setLabel(componentData.label)
                    .setStyle(componentData.style)
                    .setRequired(componentData.required)
                    .setValue(currentValue || ''); // Garante que não é 'null' ou 'undefined'

                if (componentData.max_length) {
                    textInput.setMaxLength(componentData.max_length);
                }
                if (componentData.min_length) {
                    textInput.setMinLength(componentData.min_length);
                }
                if (componentData.placeholder) {
                    textInput.setPlaceholder(componentData.placeholder);
                }

                actionRow.addComponents(textInput);
            });
            modal.addComponents(actionRow);
        });

		// 5. Exibe o modal novamente para edição
		await interaction.showModal(modal);
	},
};