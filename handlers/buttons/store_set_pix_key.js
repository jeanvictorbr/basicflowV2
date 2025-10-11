// Crie em: handlers/buttons/store_set_pix_key.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'store_set_pix_key',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_store_set_pix_key')
            .setTitle('Definir Chave PIX');

        const pixInput = new TextInputBuilder()
            .setCustomId('input_pix_key')
            // CORREÇÃO: Texto do label encurtado para menos de 45 caracteres.
            .setLabel("Sua Chave PIX (Telefone, E-mail, etc.)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Cole sua chave aqui...')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(pixInput));
        await interaction.showModal(modal);
    }
};