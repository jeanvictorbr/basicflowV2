// Crie em: handlers/buttons/dev_guild_send_dm_.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'dev_guild_send_dm_',
    async execute(interaction) {
        const guildId = interaction.customId.split('_')[4];
        
        const modal = new ModalBuilder()
            .setCustomId(`modal_dev_guild_send_dm_${guildId}`)
            .setTitle('Enviar Mensagem ao Dono');

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('input_message')
                    .setLabel("Mensagem a ser enviada")
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Digite sua mensagem aqui...')
                    .setRequired(true)
            )
        );
        await interaction.showModal(modal);
    }
};