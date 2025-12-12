// handlers/selects/dev_flow_select_feature.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const FEATURES = require('../../config/features.js');

module.exports = {
    customId: 'dev_flow_select_feature',
    async execute(interaction) {
        const selectedFeatureKey = interaction.values[0];
        const featureInfo = FEATURES[selectedFeatureKey];

        // Cria o Modal
        // Passamos a KEY no customId para recuperar depois
        const modal = new ModalBuilder()
            .setCustomId(`dev_flow_add_item_sub_${selectedFeatureKey}`)
            .setTitle(`Configurar: ${featureInfo ? featureInfo.name.substring(0, 30) : selectedFeatureKey}`);

        // Inputs
        const nameInput = new TextInputBuilder()
            .setCustomId('input_name')
            .setLabel("Nome do Produto (na Loja)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder(featureInfo ? featureInfo.name : "Ex: Premium Mensal")
            .setValue(featureInfo ? featureInfo.name : "")
            .setRequired(true);

        const priceInput = new TextInputBuilder()
            .setCustomId('input_price')
            .setLabel("Preço em FlowCoins")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ex: 5000")
            .setRequired(true);

        const durationInput = new TextInputBuilder()
            .setCustomId('input_duration')
            .setLabel("Duração (Dias)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("30")
            .setValue("30") // Padrão 30 dias
            .setRequired(true);

        const emojiInput = new TextInputBuilder()
            .setCustomId('input_emoji')
            .setLabel("Emoji do Produto")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("💎")
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(priceInput),
            new ActionRowBuilder().addComponents(durationInput),
            new ActionRowBuilder().addComponents(emojiInput)
        );

        await interaction.showModal(modal);
    }
};