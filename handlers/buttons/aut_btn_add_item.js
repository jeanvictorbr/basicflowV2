const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'aut_btn_add_item_',
    async execute(interaction) {
        // O ID vem como aut_btn_add_item_PAINELID
        const panelId = interaction.customId.split('_')[4];

        const modal = new ModalBuilder()
            .setCustomId(`modal_aut_add_role_${panelId}`)
            .setTitle('Adicionar Opção ao Menu');

        const roleInput = new TextInputBuilder()
            .setCustomId('input_role_id')
            .setLabel("ID do Cargo (@Cargo ou números)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ex: 123456789012345678")
            .setRequired(true);

        const labelInput = new TextInputBuilder()
            .setCustomId('input_role_label')
            .setLabel("Nome na Lista (Label)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ex: Membro VIP")
            .setRequired(true);

        const emojiInput = new TextInputBuilder()
            .setCustomId('input_role_emoji')
            .setLabel("Emoji (Opcional)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("💎")
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(roleInput),
            new ActionRowBuilder().addComponents(labelInput),
            new ActionRowBuilder().addComponents(emojiInput)
        );

        await interaction.showModal(modal);
    }
};