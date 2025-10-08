// handlers/selects/select_dev_key_features.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'select_dev_key_features',
    async execute(interaction) {
        const features = interaction.values.join(',');

        const modal = new ModalBuilder()
            .setCustomId(`modal_dev_key_create_${features}`)
            .setTitle('Detalhes da Nova Chave');

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_duration').setLabel("Duração da chave (em dias)").setStyle(TextInputStyle.Short).setPlaceholder('Ex: 30').setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_uses').setLabel("Quantidade de usos").setStyle(TextInputStyle.Short).setPlaceholder('Ex: 1').setValue('1').setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_comment').setLabel("Comentário / Cliente").setStyle(TextInputStyle.Short).setPlaceholder('Ex: Venda para a Guilda X').setRequired(false)
            )
        );

        await interaction.showModal(modal);
    }
};