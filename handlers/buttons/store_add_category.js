// Crie em: handlers/buttons/store_add_category.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'store_add_category',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_store_add_category')
            .setTitle('Criar Nova Categoria');

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_name').setLabel("Nome da Categoria").setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_desc').setLabel("Descrição (opcional)").setStyle(TextInputStyle.Paragraph).setRequired(false)
            )
        );
        await interaction.showModal(modal);
    }
};