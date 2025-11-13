const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'dev_key_create_custom',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_dev_key_create_custom_submit')
            .setTitle('Criar Key Personalizada');

        const keyInput = new TextInputBuilder()
            .setCustomId('key_name')
            .setLabel('Nome da Chave (Ex: VIP-JOAO)')
            .setPlaceholder('Sem espaços')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const daysInput = new TextInputBuilder()
            .setCustomId('duration')
            .setLabel('Duração (Dias)')
            .setValue('30')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const usesInput = new TextInputBuilder()
            .setCustomId('uses')
            .setLabel('Quantidade de Usos')
            .setValue('1')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const featuresInput = new TextInputBuilder()
            .setCustomId('features')
            .setLabel('Funcionalidades (Separadas por vírgula)')
            .setValue('ALL')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(keyInput),
            new ActionRowBuilder().addComponents(daysInput),
            new ActionRowBuilder().addComponents(usesInput),
            new ActionRowBuilder().addComponents(featuresInput)
        );

        await interaction.showModal(modal);
    }
};