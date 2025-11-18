// File: handlers/buttons/aut_showcase_set_role.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    customId: 'aut_showcase_set_role',
    async execute(interaction) {
        await interaction.deferUpdate({ flags: EPHEMERAL_FLAG });
        
        const menu = {
            type: 17,
            flags: V2_FLAG | EPHEMERAL_FLAG,
            accent_color: 0xFAA61A,
            components: [
                { "type": 10, "content": "## 🏷️ Definir Cargo\n> Selecione o cargo que os membros receberão ao se verificarem via CloudFlow." },
                {
                    "type": 1, "components": [
                        { "type": 6, "custom_id": "select_aut_showcase_set_role", "placeholder": "Escolha um cargo..." }
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