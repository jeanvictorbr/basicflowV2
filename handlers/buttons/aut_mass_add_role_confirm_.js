// handlers/buttons/aut_mass_add_role_confirm_.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');
const runMassRoleTask = require('../../utils/massRoleTask'); // Importa a nova função

module.exports = {
    customId: 'aut_mass_add_role_confirm_',
    async execute(interaction) {
        // 1. Responde imediatamente
        await interaction.deferUpdate();
        const roleId = interaction.customId.split('_').pop();

        // 2. Inicia a tarefa em segundo plano (NÃO USAR AWAIT)
        runMassRoleTask(
            interaction.user,
            interaction.guild,
            roleId,
            'add',
            'all', // Filtro
            'Adicionar cargo (Todos os Membros)'
        );

        // 3. Libera a interface do usuário
        const payload = {
            type: 17,
            components: [
                { type: 10, content: `## ✅ Tarefa Iniciada\nIniciando a adição do cargo <@&${roleId}> para **todos** os membros em segundo plano.` },
                { type: 10, content: `A operação será executada em lotes para evitar falhas.\n\n**Você receberá um relatório no seu privado (DM) quando a operação for concluída.**` },
                { type: 1, components: [{ type: 2, style: 2, label: 'Voltar ao Menu', emoji: { name: '⬅️' }, custom_id: 'aut_mass_roles_menu' }] }
            ]
        };

        return interaction.editReply({
            ...payload,
            flags: EPHEMERAL_FLAG | V2_FLAG
        });
    }
};