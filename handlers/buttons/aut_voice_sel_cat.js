const { ChannelSelectMenuBuilder, ChannelType, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'aut_voice_sel_cat',
    async execute(interaction) {
        const select = new ChannelSelectMenuBuilder()
            .setCustomId('aut_voice_save_cat')
            .setPlaceholder('Selecione a Categoria para as salas')
            .addChannelTypes(ChannelType.GuildCategory)
            .setMaxValues(1);

        await interaction.reply({
            components: [
                { type: 10, content: "📂 Selecione a **Categoria** onde as salas criadas ficarão:", style: 1 },
                { type: 1, components: [select.toJSON()] }
            ],
            flags: 1 << 15,
            ephemeral: true
        });
    }
};