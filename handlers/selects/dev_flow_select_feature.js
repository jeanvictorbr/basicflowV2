// handlers/selects/dev_flow_select_feature.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const FEATURES = require('../../config/features.js');

module.exports = {
    customId: 'dev_flow_select_feature',
    async execute(interaction) {
        const selectedValue = interaction.values[0]; 
        
        const featureInfo = FEATURES.find(f => f.value === selectedValue);
        const displayName = featureInfo ? featureInfo.label : selectedValue;

        const modal = new ModalBuilder()
            .setCustomId(`dev_flow_add_item_sub_${selectedValue}`)
            .setTitle(`Criar: ${displayName.substring(0, 20)}...`);

        // 1. Nome
        const nameInput = new TextInputBuilder()
            .setCustomId('input_name')
            .setLabel("Nome do Produto")
            .setStyle(TextInputStyle.Short)
            .setValue(displayName)
            .setRequired(true);

        // 2. Preço
        const priceInput = new TextInputBuilder()
            .setCustomId('input_price')
            .setLabel("Preço (FlowCoins)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("5000")
            .setRequired(true);

        // 3. Duração
        const durationInput = new TextInputBuilder()
            .setCustomId('input_duration')
            .setLabel("Duração (Dias)")
            .setStyle(TextInputStyle.Short)
            .setValue("30")
            .setRequired(true);

        // 4. Emoji
        const emojiInput = new TextInputBuilder()
            .setCustomId('input_emoji')
            .setLabel("Emoji")
            .setStyle(TextInputStyle.Short)
            .setValue("📦")
            .setRequired(false);

        // 5. [NOVO] Descrição
        const descInput = new TextInputBuilder()
            .setCustomId('input_desc')
            .setLabel("Descrição Detalhada")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Ex: Libera acesso total ao módulo X...")
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(priceInput),
            new ActionRowBuilder().addComponents(durationInput),
            new ActionRowBuilder().addComponents(emojiInput),
            new ActionRowBuilder().addComponents(descInput)
        );

        await interaction.showModal(modal);
    }
};