// File: handlers/buttons/aut_showcase_publish.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    customId: 'aut_showcase_publish',
    async execute(interaction) {
        await interaction.deferUpdate({ flags: EPHEMERAL_FLAG });
        
        const menu = {
            type: 17,
            flags: V2_FLAG | EPHEMERAL_FLAG,
            accent_color: 0xFAA61A,
            components: [
                { "type": 10, "content": "## 🚀 Publicar Vitrine\n> Selecione o canal de texto onde a mensagem de verificação deve ser enviada." },
                {
                    "type": 1, "components": [
                        { 
                            "type": 8, // CORRIGIDO: 5 para 8
                            "custom_id": "select_aut_showcase_publish", 
                            "placeholder": "Escolha um canal...", 
                            "channel_types": [0] 
                        }
                    ]
                },
                {
                    "type": 1, "components": [
                         // CORRIGIDO: Botão Voltar aponta para o Hub de Registros OAuth
                        { "type": 2, "style": 2, "label": "Voltar", "custom_id": "aut_reg_open_oauth_hub" }
                    ]
                }
            ]
        };
        await interaction.editReply(menu);
    }
};