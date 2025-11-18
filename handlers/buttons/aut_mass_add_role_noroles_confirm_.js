// handlers/buttons/aut_mass_add_role_noroles_confirm_.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');
const runMassRoleTask = require('../../utils/massRoleTask'); // Importa a nova função

module.exports = {
    customId: 'aut_mass_add_role_noroles_confirm_',
    async execute(interaction) {
        // 1. Responde imediatamente
        await interaction.deferUpdate();
        const roleId = interaction.customId.split('_').pop();

        // 2. Inicia a tarefa em segundo plano (NÃO USAR AWAIT)
        // A própria tarefa fará a verificação do cargo e enviará DM em caso de falha.
        runMassRoleTask(
            interaction.user, 
            interaction.guild, 
            roleId, 
            'add', 
            'no_roles', // Filtro
            'Adicionar cargo (Membros sem Cargo)'
        );

        // 3. Libera a interface do usuário
        const payload = {
            type: 17,
            components: [
                { type: 10, content: `## ✅ Tarefa Iniciada\nIniciando a adição do cargo <@&${roleId}> para membros **sem cargo** em segundo plano.` },
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