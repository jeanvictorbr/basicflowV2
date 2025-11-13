const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_gw_config_logs',
    async execute(interaction) {
        await interaction.reply({
            components: [
                {
                    type: 17,
                    components: [
                        { type: 10, content: "## 📜 Logs de Sorteios\nSelecione o canal onde os resultados e ações dos sorteios serão registrados." },
                        { type: 1, components: [{
                            type: 8, // Channel Select
                            custom_id: "aut_gw_set_log_",
                            channel_types: [0], // Text Channels
                            placeholder: "Selecione um canal de texto..."
                        }]}
                    ]
                }
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};