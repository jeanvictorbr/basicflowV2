const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'store_cv_set_', 
    execute: async (interaction) => {
        const parts = interaction.customId.split('_');
        const categoryId = parts.pop(); 
        const action = parts[3]; // title, desc, image, color

        let modalTitle, inputLabel, inputId, inputStyle, placeholder;

        switch(action) {
            case 'title':
                modalTitle = 'Título da Vitrine';
                inputLabel = 'Novo Título';
                inputId = 'title_input';
                inputStyle = TextInputStyle.Short;
                placeholder = 'Ex: Loja VIP - Melhores Ofertas';
                break;
            case 'desc':
                modalTitle = 'Descrição da Vitrine';
                inputLabel = 'Nova Descrição';
                inputId = 'desc_input';
                inputStyle = TextInputStyle.Paragraph;
                placeholder = 'Use \\n para quebrar linhas...';
                break;
            case 'image':
                modalTitle = 'Banner da Vitrine';
                inputLabel = 'URL da Imagem';
                inputId = 'image_input';
                inputStyle = TextInputStyle.Short;
                placeholder = 'https://imgur.com/...';
                break;
            case 'color':
                modalTitle = 'Cor da Vitrine';
                inputLabel = 'Código Hex (Ex: #FF0000)';
                inputId = 'color_input';
                inputStyle = TextInputStyle.Short;
                placeholder = '#FFFFFF';
                break;
            default:
                return;
        }

        const modal = new ModalBuilder()
            .setCustomId(`store_cv_save_${action}_${categoryId}`)
            .setTitle(modalTitle);

        const input = new TextInputBuilder()
            .setCustomId(inputId)
            .setLabel(inputLabel)
            .setStyle(inputStyle)
            .setPlaceholder(placeholder)
            .setRequired(action !== 'image');

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }
};