// handlers/buttons/updates_set_channel.js
const { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'updates_set_channel',
    async execute(interaction) {
        const selectMenu = new ChannelSelectMenuBuilder()
            .setCustomId('select_updates_channel')
            .setPlaceholder('Selecione o canal...')
            .addChannelTypes(ChannelType.GuildText);
            
        const cancelButton = new ButtonBuilder()
            .setCustomId('open_updates_menu')
            .setLabel('Cancelar')
            .setStyle(ButtonStyle.Secondary);

        await interaction.update({
            components: [
                {
                    type: 17,
                    components: [
                        { type: 10, content: "## 🔧 Selecionar Canal" },
                        { type: 10, content: "> Selecione um canal de texto na lista abaixo para receber as atualizações." }
                    ]
                },
                new ActionRowBuilder().addComponents(selectMenu),
                new ActionRowBuilder().addComponents(cancelButton)
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};