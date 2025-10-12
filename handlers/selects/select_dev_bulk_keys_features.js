// Crie em: handlers/selects/select_dev_bulk_keys_features.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'select_dev_bulk_keys_features',
    async execute(interaction) {
        const features = interaction.values.join(',');
        const encodedFeatures = Buffer.from(features).toString('base64');

        const modal = new ModalBuilder()
            .setCustomId(`modal_dev_bulk_keys_create_${encodedFeatures}`)
            .setTitle('Detalhes do Lote de Chaves');

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_quantity').setLabel("Quantidade de chaves a serem geradas").setStyle(TextInputStyle.Short).setPlaceholder('Ex: 10').setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_duration').setLabel("Duração de cada chave (em dias)").setStyle(TextInputStyle.Short).setPlaceholder('Ex: 30').setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_uses').setLabel("Quantidade de usos por chave").setStyle(TextInputStyle.Short).setValue('1').setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_comment').setLabel("Comentário / Lote").setStyle(TextInputStyle.Short).setPlaceholder('Ex: Lote para Venda #1').setRequired(false)
            )
        );

        await interaction.showModal(modal);
    }
};