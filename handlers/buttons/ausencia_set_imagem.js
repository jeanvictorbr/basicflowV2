// handlers/buttons/ausencia_set_imagem.js
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const isPremiumActive = require('../../utils/premiumCheck.js');

module.exports = {
    customId: 'ausencia_set_imagem',
    async execute(interaction) {
        const isPremium = await isPremiumActive(interaction.guild.id);
        if (!isPremium) {
            return interaction.reply({ content: 'Esta é uma funcionalidade premium. Ative uma chave para usá-la.', ephemeral: true });
        }
        
        const modal = new ModalBuilder()
            .setCustomId('modal_ausencia_imagem')
            .setTitle('Alterar Imagem da Vitrine de Ausências');

        const imageUrlInput = new TextInputBuilder()
            .setCustomId('input_imagem_url')
            .setLabel("URL da imagem (link direto)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('https://i.imgur.com/seu-link.png')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(imageUrlInput));
        await interaction.showModal(modal);
    }
};