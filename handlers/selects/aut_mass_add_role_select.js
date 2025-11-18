// handlers/selects/aut_mass_add_role_select.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_mass_add_role_select',
    async execute(interaction) {
        const roleId = interaction.values[0];
        const role = await interaction.guild.roles.fetch(roleId);

        if (!role) {
            // --- CORREÇÃO AQUI ---
            return interaction.update({
                type: 17, flags: EPHEMERAL_FLAG | V2_FLAG,
                components: [
                    { type: 10, content: "## ❌ Erro\nCargo não encontrado." },
                    { type: 1, components: [{ type: 2, style: 2, label: 'Voltar', emoji: { name: '⬅️' }, custom_id: 'aut_mass_roles_menu' }] }
                ]
            });
        }
        
        if (!role.editable) {
            // --- CORREÇÃO AQUI ---
             return interaction.update({
                type: 17, flags: EPHEMERAL_FLAG | V2_FLAG,
                components: [
                    { type: 10, content: `## ❌ Erro de Permissão\nO cargo <@&${roleId}> é **mais alto** que o meu cargo no Discord. Não posso gerenciá-lo.` },
                    { type: 1, components: [{ type: 2, style: 2, label: 'Voltar', emoji: { name: '⬅️' }, custom_id: 'aut_mass_roles_menu' }] }
                ]
            });
        }

        const membersCount = interaction.guild.memberCount;

        const payload = {
            type: 17,
            flags: EPHEMERAL_FLAG | V2_FLAG, // Adicionando flags
            components: [
                { type: 10, content: `## ⚠️ Confirmação Final\nVocê tem certeza que deseja **ADICIONAR** o cargo <@&${roleId}> para **TODOS** os \`${membersCount}\` membros do servidor?` },
                { type: 10, content: "Esta ação é irreversível e pode demorar vários minutos." },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 3, label: 'Sim, Adicionar Cargo', emoji: { name: '➕' }, custom_id: `aut_mass_add_role_confirm_${roleId}` },
                        { type: 2, style: 2, label: 'Cancelar', emoji: { name: '✖️' }, custom_id: 'aut_mass_roles_menu' }
                    ]
                }
            ]
        };

        // --- CORREÇÃO AQUI ---
        return interaction.update(payload);
    }
};