// handlers/buttons/registros_set_canal_vitrine.js
const { ChannelType } = require('discord.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    customId: 'registros_set_canal_vitrine',
    async execute(interaction) {
        
        const payload = {
            type: 17,
            accent_color: 5763719,
            components: [
                {
                    type: 10,
                    content: "## 📲 Definir Canal da Vitrine\n> Selecione o canal onde o painel de registro será publicado."
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 8, // Channel Select
                            // O custom_id abaixo deve corresponder ao seu handler existente:
                            // handlers/selects/select_registros_publicar_vitrine.js
                            custom_id: "select_registros_publicar_vitrine", 
                            placeholder: "Selecione um canal de texto...",
                            channel_types: [ChannelType.GuildText] 
                        }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    type: 1,
                    components: [
                        { 
                            type: 2, 
                            style: 2, 
                            label: "Voltar", 
                            emoji: { "name": "↩️" }, 
                            // Este ID volta para o SUB-MENU, não o menu principal
                            custom_id: "registros_config_vitrine" 
                        }
                    ]
                }
            ]
        };
        
        await interaction.update({ ...payload, flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};