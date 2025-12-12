const { ChannelSelectMenuBuilder, ChannelType, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'form_post_start_',
    async execute(interaction) {
        const customId = interaction.customId.split('form_post_start_')[1];

        const select = new ChannelSelectMenuBuilder()
            .setCustomId(`form_post_save_${customId}`)
            .setPlaceholder('Selecione o canal para postar o formulário')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setMaxValues(1);

        await interaction.reply({
            components: [
                { type: 10, content: "📨 **Onde devo enviar o painel do formulário?**\nSelecione o canal abaixo:", style: 1 },
                { type: 1, components: [select.toJSON()] }
            ],
            flags: 1 << 15,
            ephemeral: true
        });
    }
};