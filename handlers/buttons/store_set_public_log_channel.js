// handlers/buttons/store_set_public_log_channel.js
const { ChannelType } = require('discord.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    customId: 'store_set_public_log_channel',
    async execute(interaction) {
        const payload = {
            type: 17,
            accent_color: 5763719,
            components: [
                {
                    type: 10,
                    content: "## 📣 Definir Canal de Log Pública\n> Selecione o canal onde as vendas aprovadas serão anunciadas publicamente."
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 8, // Channel Select
                            custom_id: "select_store_public_log_channel",
                            placeholder: "Selecione um canal...",
                            channel_types: [ChannelType.GuildText]
                        }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 2, label: "Voltar", emoji: { name: "↩️" }, custom_id: "store_config_advanced" }
                    ]
                }
            ]
        };
        
        await interaction.update({ ...payload, flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};