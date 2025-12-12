const { ChannelSelectMenuBuilder, ChannelType, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'form_set_log_',
    async execute(interaction) {
        const customId = interaction.customId.split('form_set_log_')[1];
        
        const select = new ChannelSelectMenuBuilder()
            .setCustomId(`form_save_log_${customId}`)
            .setPlaceholder('Selecione o canal de Logs')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setMaxValues(1);

        await interaction.reply({
            components: [
                { type: 10, content: "📜 Onde devo enviar as respostas dos membros?", style: 1 },
                { type: 1, components: [select] }
            ],
            flags: 1 << 15, ephemeral: true
        });
    }
};