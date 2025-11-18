// handlers/buttons/aut_mass_add_role_noroles_start.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    customId: 'aut_mass_add_role_noroles_start',
    async execute(interaction) {
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
            const errorPayload = {
                type: 17,
                flags: EPHEMERAL_FLAG | V2_FLAG,
                components: [
                    { type: 10, content: "## ❌ Erro de Permissão\nEu preciso da permissão `Gerenciar Cargos` para executar esta ação." },
                    { type: 1, components: [{ type: 2, style: 2, label: 'Voltar', emoji: { name: '⬅️' }, custom_id: 'aut_mass_roles_menu' }] }
                ]
            };
            return interaction.update(errorPayload);
        }

        const payload = {
            type: 17,
            flags: EPHEMERAL_FLAG | V2_FLAG,
            components: [
                { type: 10, content: "## 👤 Adicionar (Membros sem Cargo)\nSelecione o cargo que você deseja **ADICIONAR** a todos os membros que **NÃO POSSUEM NENHUM CARGO**." },
                {
                    type: 1,
                    components: [
                        {
                            // --- CORREÇÃO AQUI ---
                            type: 6, // 6 = Role Select (Menu de Cargos)
                            // --- FIM DA CORREÇÃO ---
                            custom_id: 'aut_mass_add_role_noroles_select',
                            placeholder: 'Selecione o cargo...',
                        }
                    ]
                },
                { type: 1, components: [{ type: 2, style: 2, label: 'Cancelar', emoji: { name: '⬅️' }, custom_id: 'aut_mass_roles_menu' }] }
            ]
        };

        return interaction.update(payload);
    }
};