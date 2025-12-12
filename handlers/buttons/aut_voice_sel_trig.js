const { ChannelSelectMenuBuilder, ChannelType, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'aut_voice_sel_trig',
    async execute(interaction) {
        const select = new ChannelSelectMenuBuilder()
            .setCustomId('aut_voice_save_trig')
            .setPlaceholder('Selecione o canal de voz "Criar Sala"')
            .addChannelTypes(ChannelType.GuildVoice)
            .setMaxValues(1);

        // Resposta V2: Usamos type 10 para instrução e type 1 para o select
        await interaction.reply({
            components: [
                { type: 10, content: "🔽 Selecione o canal de voz que servirá de **Gatilho**:", style: 1 },
                { type: 1, components: [select.toJSON()] } // Select dentro de Action Row
            ],
            flags: 1 << 15, // V2 Flag
            ephemeral: true
        });
    }
};