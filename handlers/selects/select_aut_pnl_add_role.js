const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'select_aut_pnl_add_role_',
    async execute(interaction) {
        const panelId = interaction.customId.split('_')[5];
        const roleId = interaction.values[0];
        const role = interaction.roles.get(roleId);

        // Abre modal para configurar Label e Emoji deste cargo selecionado
        // Passamos o RoleID no customId do modal para recuperar depois
        const modal = new ModalBuilder()
            .setCustomId(`modal_pnl_role_details_${panelId}_${roleId}`)
            .setTitle(`Configurar: ${role.name.substring(0, 20)}`);

        const labelInput = new TextInputBuilder()
            .setCustomId('in_label')
            .setLabel("Nome no Menu (Label)")
            .setValue(role.name) // Já vem preenchido com o nome do cargo
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const emojiInput = new TextInputBuilder()
            .setCustomId('in_emoji')
            .setLabel("Emoji (Opcional)")
            .setPlaceholder("💎")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(labelInput),
            new ActionRowBuilder().addComponents(emojiInput)
        );

        await interaction.showModal(modal);
    }
};