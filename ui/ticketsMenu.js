// meu-bot/ui/ticketsMenu.js

// Interface para a configuração do módulo de Tickets.
const ticketsMenuEmbed = {
    ephemeral: true,
    embeds: [{
        "type": 17,
        "title": "🚨 Configuração de Tickets",
        "description": "Selecione uma opção abaixo para configurar o sistema de tickets.",
        "color": 16711684,
        "components": [
            {
                "type": 1, // Action Row
                "components": [
                    {
                        "type": 3, // String Select Menu
                        "custom_id": "ticket_config_select",
                        "placeholder": "Selecione uma categoria para configurar",
                        "options": [
                            {
                                "label": "Canal de Abertura",
                                "value": "set_ticket_channel",
                                "description": "Define em qual canal o painel para abrir tickets será enviado.",
                                "emoji": { "name": "💬" }
                            },
                            {
                                "label": "Cargo de Suporte",
                                "value": "set_ticket_role",
                                "description": "Define qual cargo terá acesso aos tickets abertos.",
                                "emoji": { "name": "🛡️" }
                            },
                            {
                                "label": "Logs de Tickets",
                                "value": "set_ticket_logs",
                                "description": "Define o canal onde os logs de tickets serão registrados.",
                                "emoji": { "name": "📜" }
                            }
                        ]
                    }
                ]
            },
            {
                "type": 1, // Action Row
                "components": [
                    {
                        "type": 2, // Button
                        "style": 2, // Secondary
                        "label": "Voltar",
                        "emoji": { "name": "⬅️" },
                        "custom_id": "back_to_main_config" // ID para voltar ao menu principal
                    }
                ]
            }
        ]
    }]
};

module.exports = {
    ticketsMenuEmbed
};