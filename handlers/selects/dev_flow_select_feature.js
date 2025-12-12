// handlers/selects/dev_flow_select_feature.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const FEATURES = require('../../config/features.js');

module.exports = {
    customId: 'dev_flow_select_feature',
    async execute(interaction) {
        const selectedValue = interaction.values[0]; // Ex: "STORE"
        
        // Busca o objeto correto dentro do Array
        const featureInfo = FEATURES.find(f => f.value === selectedValue);
        const displayName = featureInfo ? featureInfo.label : selectedValue;

        // Cria o Modal
        const modal = new ModalBuilder()
            .setCustomId(`dev_flow_add_item_sub_${selectedValue}`)
            .setTitle(`Configurar: ${displayName.substring(0, 20)}...`);

        // Inputs
        const nameInput = new TextInputBuilder()
            .setCustomId('input_name')
            .setLabel("Nome do Produto")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder(displayName) 
            .setValue(displayName) // Já vem preenchido com o nome da feature
            .setRequired(true);

        const priceInput = new TextInputBuilder()
            .setCustomId('input_price')
            .setLabel("Preço (FlowCoins)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ex: 5000")
            .setRequired(true);

        const durationInput = new TextInputBuilder()
            .setCustomId('input_duration')
            .setLabel("Duração (Dias)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("30")
            .setValue("30")
            .setRequired(true);

        const emojiInput = new TextInputBuilder()
            .setCustomId('input_emoji')
            .setLabel("Emoji")
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