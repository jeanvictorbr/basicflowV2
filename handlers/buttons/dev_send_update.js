// handlers/buttons/dev_send_update.js

module.exports = {
    customId: 'dev_send_update',
    async execute(interaction) {
        const modal = {
            "custom_id": "modal_send_update",
            "title": "📣 Enviar Nova Atualização Global",
            "components": [
                {
                    "type": 1,
                    "components": [{
                        "type": 4,
                        "custom_id": "update_version",
                        "label": "Versão (ex: v2.5.1)",
                        "style": 1,
                        "min_length": 1,
                        "max_length": 20,
                        "placeholder": "v2.5.1",
                        "required": true
                    }]
                },
                {
                    "type": 1,
                    "components": [{
                        "type": 4,
                        "custom_id": "update_title",
                        "label": "Título da Atualização",
                        "style": 1,
                        "min_length": 5,
                        "max_length": 100,
                        "placeholder": "Sistema de Ponto V2 e Melhorias na IA!",
                        "required": true
                    }]
                },
                {
                    "type": 1,
                    "components": [{
                        "type": 4,
                        "custom_id": "update_news",
                        "label": "Novidades (use \"-\" para listas)",
                        "style": 2,
                        "min_length": 10,
                        "placeholder": "- Adicionado o novo Painel de Ponto V2.\n- Melhorada a velocidade de resposta da IA.",
                        "required": true
                    }]
                },
                {
                    "type": 1,
                    "components": [{
                        "type": 4,
                        "custom_id": "update_fixes",
                        "label": "Correções (Opcional)",
                        "style": 2,
                        "placeholder": "- Corrigido bug no envio do botão de ponto.\n- Otimizado o comando /configurar.",
                        "required": false
                    }]
                }
            ]
        };
        await interaction.showModal(modal);
    }
};