const db = require('../../database');
const { PermissionsBitField } = require('discord.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_gw_manage_',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '🔒 Apenas administradores podem gerenciar o sorteio.', flags: EPHEMERAL_FLAG });
        }

        const messageId = interaction.customId.split('_').pop();
        const gw = (await db.query("SELECT * FROM automations_giveaways WHERE message_id = $1", [messageId])).rows[0];

        if (!gw) return interaction.reply({ content: '❌ Sorteio não encontrado.', flags: EPHEMERAL_FLAG });

        const manageLayout = {
            type: 17,
            accent_color: 42751, 
            components: [
                { type: 10, content: `## ⚙️ Painel do Sorteio: ${gw.prize}\nUse as opções abaixo para controlar este sorteio.` },
                { type: 14, divider: true, spacing: 2 },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 1, label: "Editar Info", emoji: { name: "📝" }, custom_id: `aut_gw_act_edit_${messageId}`, disabled: gw.status !== 'active' },
                        { type: 2, style: 1, label: "Restringir Cargos", emoji: { name: "🔒" }, custom_id: `aut_gw_act_roles_${messageId}`, disabled: gw.status !== 'active' },
                        { type: 2, style: 1, label: "Cargos Bônus", emoji: { name: "✨" }, custom_id: `aut_gw_act_bonus_${messageId}`, disabled: gw.status !== 'active' }
                    ]
                },
                { type: 14, divider: true, spacing: 1 }, // Espaçamento
                {
                    type: 1,
                    components: [
                        // Renomeado para SORTEAR AGORA
                        { type: 2, style: 3, label: "Sortear Agora", emoji: { name: "🎲" }, custom_id: `aut_gw_act_end_${messageId}`, disabled: gw.status !== 'active' },
                        { type: 2, style: 1, label: "Reroll (Resortear)", emoji: { name: "🔄" }, custom_id: `aut_gw_act_reroll_${messageId}`, disabled: gw.status === 'active' },
                        // NOVO BOTÃO DE CANCELAR
                        { type: 2, style: 4, label: "Cancelar Sorteio", emoji: { name: "✖️" }, custom_id: `aut_gw_act_cancel_${messageId}`, disabled: gw.status !== 'active' }
                    ]
                }
            ]
        };

        await interaction.reply({ components: [manageLayout], flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};