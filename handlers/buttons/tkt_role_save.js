// handlers/buttons/tkt_role_save.js
const db = require('../../database.js');
const generateSuccessUI = require('../../ui/ticketDepartmentSuccess.js');

module.exports = {
    customId: 'tkt_role_save',
    async execute(interaction) {
        const data = interaction.client.tempDeptData?.get(interaction.user.id);

        if (!data) return interaction.update({ content: '❌ Sessão expirada.', components: [] });

        if (data.selectedIds.length === 0) {
            return interaction.reply({ content: '⚠️ Selecione pelo menos um cargo.', ephemeral: true });
        }

        try {
            // Converte array para JSON string para o banco (coluna JSONB)
            const rolesJson = JSON.stringify(data.selectedIds);

            await db.query(
                `INSERT INTO ticket_departments (guild_id, name, description, emoji, role_id) VALUES ($1, $2, $3, $4, $5)`,
                [interaction.guild.id, data.name, data.description, data.emoji, rolesJson]
            );

            interaction.client.tempDeptData.delete(interaction.user.id);

            const payload = generateSuccessUI(data.name, data.selectedIds);
            await interaction.update(payload);

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Erro no banco de dados.', ephemeral: true });
        }
    }
};