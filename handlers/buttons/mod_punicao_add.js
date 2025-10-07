// Substitua em: handlers/buttons/mod_punicao_add.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_punicao_add',
    async execute(interaction) {
        // Agora, em vez de um modal, mostramos três botões de escolha
        const components = [
            {
                type: 17, accent_color: 11393254,
                components: [
                    { type: 10, content: "## ➕ Adicionar Punição" },
                    { type: 10, content: "> Como você deseja associar um cargo a esta punição?" },
                    { type: 14, divider: true, spacing: 2 },
                    {
                        type: 1, components: [
                            { type: 2, style: 3, label: "Criar Cargo Automaticamente", emoji: { name: "🤖" }, custom_id: "mod_punicao_add_auto_role" },
                            { type: 2, style: 1, label: "Associar Cargo Existente", emoji: { name: "🔗" }, custom_id: "mod_punicao_add_manual_role" },
                            { type: 2, style: 2, label: "Sem Cargo Associado", emoji: { name: "✖️" }, custom_id: "mod_punicao_add_no_role" }
                        ]
                    },
                    { type: 14, divider: true, spacing: 1 },
                    { type: 1, components: [{ type: 2, style: 2, label: "Cancelar", "custom_id": "mod_gerir_punicoes" }] }
                ]
            }
        ];

        await interaction.update({
            components,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};