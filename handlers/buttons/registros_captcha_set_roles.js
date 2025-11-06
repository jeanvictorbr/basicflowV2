// handlers/buttons/registros_captcha_set_roles.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    customId: 'registros_captcha_set_roles',
    async execute(interaction) {
        const payload = {
            type: 17,
            accent_color: 5763719,
            components: [
                {
                    type: 10,
                    content: "## 🛂 Definir Cargos de Verificação\n> Selecione um ou mais cargos que o membro receberá ao se verificar."
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 7, // Role Select
                            custom_id: "select_registros_captcha_roles",
                            placeholder: "Selecione os cargos...",
                            min_values: 1,
                            max_values: 10 // Limite de 10 cargos por vez
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