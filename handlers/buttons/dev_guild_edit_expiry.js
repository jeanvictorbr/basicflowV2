// handlers/buttons/dev_guild_edit_expiry.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'dev_guild_edit_expiry_',
    async execute(interaction) {
        const guildId = interaction.customId.split('_')[4];

        const modal = new ModalBuilder()
            .setCustomId(`modal_dev_guild_edit_expiry_${guildId}`)
            .setTitle('Editar Validade da Licença');
        
        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_days').setLabel("Adicionar ou Remover Dias").setStyle(TextInputStyle.Short)
                .setPlaceholder('Ex: 30 para adicionar, -7 para remover').setRequired(true)
            )
        );

        await interaction.showModal(modal);
    }
};