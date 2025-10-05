const { SlashCommandBuilder } = require('discord.js');

// As flags que o Discord precisa para entender a mensagem
const V2_FLAG = 1 << 15; // Flag para ativar os componentes v2
const EPHEMERAL_FLAG = 1 << 6; // Flag para tornar a mensagem efêmera (visível só para você)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('configurar')
        .setDescription('Abre o Hub de Configurações do bot.'),

    async execute(interaction) {
        
        // ===================================================================
        // O JSON GERADO PELO DISCORD.BUILDERS FOI COLADO AQUI
        // ===================================================================
        const componentsPayload = [
            {
                "type": 17,
                "accent_color": 16711684,
                "spoiler": false,
                "components": [
                    {
                        "type": 10,
                        "content": "⚙️**Hub de configurações**⚙️"
                    },
                    {
                        "type": 14,
                        "divider": true,
                        "spacing": 2
                    },
                    {
                        "type": 9,
                        "accessory": {
                            "type": 2,
                            "style": 3,
                            "label": "Abrir",
                            "emoji": {
                                "name": "📥",
                                "id": null
                            },
                            "disabled": false,
                            "custom_id": "91e0639b02934906d94100b10afbfaa8"
                        },
                        "components": [
                            {
                                "type": 10,
                                "content": "🏖️ Ausências "
                            },
                            {
                                "type": 10,
                                "content": "Configure todo o sistema de **ausências** dentro deste módulo completo."
                            }
                        ]
                    },
                    {
                        "type": 14,
                        "divider": true,
                        "spacing": 1
                    },
                    {
                        "type": 9,
                        "accessory": {
                            "type": 2,
                            "style": 3,
                            "label": "Abrir",
                            "emoji": {
                                "name": "📥",
                                "id": null
                            },
                            "disabled": false,
                            "custom_id": "76b54bbaec134998bff58d3aa2eefafd"
                        },
                        "components": [
                            {
                                "type": 10,
                                "content": "📂 Registros"
                            },
                            {
                                "type": 10,
                                "content": "Configure todo o sistema de **registros** dentro deste módulo completo."
                            }
                        ]
                    },
                    {
                        "type": 14,
                        "divider": true,
                        "spacing": 1
                    },
                    {
                        "type": 9,
                        "accessory": {
                            "type": 2,
                            "style": 3,
                            "label": "Abrir",
                            "emoji": {
                                "id": null,
                                "name": "📥"
                            },
                            "disabled": false,
                            "custom_id": "41d6a2a163724b908624dadf122bb93f"
                        },
                        "components": [
                            {
                                "type": 10,
                                "content": "🚨 Tickets"
                            }
                        ]
                    },
                    {
                        "type": 10,
                        "content": "Configure todo o sistema de **tickets** dentro deste módulo completo."
                    },
                    {
                        "type": 14,
                        "divider": true,
                        "spacing": 1
                    },
                    {
                        "type": 9,
                        "components": [
                            {
                                "type": 10,
                                "content": "👔 Uniformes"
                            }
                        ],
                        "accessory": {
                            "type": 2,
                            "style": 3,
                            "label": "Abrir",
                            "emoji": {
                                "id": null,
                                "name": "📥"
                            },
                            "disabled": false,
                            "custom_id": "ed32826201a74a80bc6a8cd94e323b81"
                        }
                    },
                    {
                        "type": 10,
                        "content": "Configure todo o sistema de **uniformes** dentro deste módulo completo."
                    },
                    {
                        "type": 14,
                        "divider": true,
                        "spacing": 1
                    },
                    {
                        "type": 9,
                        "components": [
                            {
                                "type": 10,
                                "content": "⏰ Bate-Ponto"
                            },
                            {
                                "type": 10,
                                "content": "Configure todo o sistema de **bate-ponto** dentro deste módulo completo."
                            }
                        ],
                        "accessory": {
                            "type": 2,
                            "style": 3,
                            "label": "Abrir",
                            "emoji": {
                                "id": null,
                                "name": "📥"
                            },
                            "disabled": false,
                            "custom_id": "0331880c672944a6e5efdf125b6a3512"
                        }
                    },
                    {
                        "type": 14,
                        "divider": true,
                        "spacing": 1
                    },
                    {
                        "type": 1,
                        "components": [
                            {
                                "type": 2,
                                "style": 2,
                                "label": "Novidades bot",
                                "emoji": {
                                    "name": "🎉",
                                    "id": null
                                },
                                "disabled": false,
                                "custom_id": "c9cdc4dc42484645e4952ae618c00eae"
                            },
                            {
                                "type": 2,
                                "style": 4,
                                "label": "Ativar key",
                                "emoji": null,
                                "disabled": false,
                                "custom_id": "6a6167838bde470ac24446d015ed1f60"
                            },
                            {
                                "type": 2,
                                "style": 2,
                                "label": "🥇Link discord",
                                "emoji": null,
                                "disabled": false,
                                "custom_id": "eb5a88847a1246d8a13d034c9991c39d"
                            }
                        ]
                    }
                ]
            }
        ];

        // O bot envia seu design diretamente para o Discord.
        await interaction.reply({
            components: componentsPayload,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    },
};