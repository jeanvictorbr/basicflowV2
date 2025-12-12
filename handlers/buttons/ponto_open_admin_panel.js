// handlers/buttons/ponto_open_admin_panel.js
const { PermissionsBitField } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'ponto_open_admin_panel',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ Apenas administradores.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true }); // Novo menu, efêmero para não poluir

        const components = [
            {
                type: 17,
                components: [
                    { type: 10, content: '## 🛠️ Administração de Ponto\nSelecione uma ação abaixo para gerenciar os horários e sessões da equipe.' },
                    { type: 14, divider: true, spacing: 2 },
                    {
                        type: 1,
                        components: [
                            { type: 2, style: 1, label: "Ver Sessões Abertas (Force Close)", emoji: { name: "🚨" }, custom_id: "ponto_admin_view_sessions" },
                            { type: 2, style: 2, label: "Ajustar Tempo de Usuário", emoji: { name: "⏱️" }, custom_id: "ponto_admin_adjust_time" }
                        ]
                    }
                ]
            }
        ];

        await interaction.editReply({ components: components, flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};