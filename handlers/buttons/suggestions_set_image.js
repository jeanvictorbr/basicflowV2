const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'suggestions_set_image',
    // CORREÇÃO AQUI: Trocamos a ordem para (interaction, client, db)
    execute: async (interaction, client, db) => {
        
        // Verificação de segurança caso os argumentos venham invertidos em algum momento
        const realInteraction = interaction.showModal ? interaction : client;
        
        try {
            const modal = new ModalBuilder()
                .setCustomId('modal_suggestions_image')
                .setTitle('Alterar Imagem da Vitrine');

            const imageInput = new TextInputBuilder()
                .setCustomId('image_url')
                .setLabel("URL da Imagem/GIF")
                .setPlaceholder("https://i.imgur.com/...")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const firstActionRow = new ActionRowBuilder().addComponents(imageInput);
            modal.addComponents(firstActionRow);

            await realInteraction.showModal(modal);
            
        } catch (error) {
            console.error("Erro ao abrir modal:", error);
        }
    }
};