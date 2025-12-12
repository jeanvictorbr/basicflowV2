const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'form_add_q_',
    async execute(interaction) {
        const customId = interaction.customId.split('form_add_q_')[1];
        
        const modal = new ModalBuilder()
            .setCustomId(`form_add_q_sub_${customId}`)
            .setTitle('Adicionar Pergunta');

        const labelInput = new TextInputBuilder()
            .setCustomId('label')
            .setLabel("Qual é a pergunta?")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(45) // Limite do label no modal final
            .setRequired(true);

        const styleInput = new TextInputBuilder()
            .setCustomId('style')
            .setLabel("Tipo (1=Curta, 2=Longa)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("2")
            .setMaxLength(1)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(labelInput),
            new ActionRowBuilder().addComponents(styleInput)
        );

        await interaction.showModal(modal);
    }
};