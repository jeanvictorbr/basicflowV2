const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'form_set_role_',
    async execute(interaction) {
        const customId = interaction.customId.split('form_set_role_')[1];

        const modal = new ModalBuilder()
            .setCustomId(`form_create_role_sub_${customId}`)
            .setTitle('Cargo de Aprovação');

        const nameInput = new TextInputBuilder()
            .setCustomId('role_name')
            .setLabel("Nome do Cargo a ser dado")
            .setPlaceholder("Ex: Membro Aprovado (Bot criará se não existir)")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
        await interaction.showModal(modal);
    }
};