// handlers/buttons/main_ativar_key.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'main_ativar_key',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_ativar_key')
            .setTitle('Ativação de Licença Premium');

        const keyInput = new TextInputBuilder()
            .setCustomId('input_key')
            .setLabel("Insira sua chave de ativação")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('XXXX-XXXX-XXXX-XXXX')
            .setRequired(true);
        
        modal.addComponents(new ActionRowBuilder().addComponents(keyInput));
        await interaction.showModal(modal);
    }
};