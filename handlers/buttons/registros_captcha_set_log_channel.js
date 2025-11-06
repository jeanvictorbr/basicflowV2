// handlers/buttons/registros_captcha_set_log_channel.js
const { ChannelType } = require('discord.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    customId: 'registros_captcha_set_log_channel',
    async execute(interaction) {
        const payload = {
            type: 17,
            accent_color: 5763719,
            components: [
                {
                    type: 10,
                    content: "## 📲 Definir Canal de Logs\n> Selecione o canal para onde as logs de verificações bem-sucedidas serão enviadas."
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 8, // Channel Select
                            custom_id: "select_registros_captcha_log_channel",
                            placeholder: "Selecione um canal...",
                            channel_types: [ChannelType.GuildText] // Apenas canais de texto
                        }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 2, label: "Voltar", emoji: { name: "↩️" }, custom_id: "open_registros_menu" }
                    ]
                }
            ]
        };
        
        await interaction.update({ ...payload, flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};