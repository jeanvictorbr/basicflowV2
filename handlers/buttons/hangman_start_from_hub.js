// Crie este arquivo em: handlers/buttons/hangman_start_from_hub.js
const { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'hangman_start_from_hub',
    async execute(interaction) {
        const selectMenu = new ChannelSelectMenuBuilder()
            .setCustomId('select_hangman_start_channel')
            .setPlaceholder('Selecione o canal para iniciar o Jogo da Forca')
            .addChannelTypes(ChannelType.GuildText);

        await interaction.reply({
            content: 'Onde você gostaria de iniciar o jogo?',
            components: [new ActionRowBuilder().addComponents(selectMenu)],
            ephemeral: true
        });
    }
};