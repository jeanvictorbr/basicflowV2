// handlers/buttons/tkt_role_menu_save.js
const db = require('../../database.js');
const generateSuccessUI = require('../../ui/ticketDepartmentSuccess.js');

module.exports = {
    customId: 'tkt_role_menu_save',
    async execute(interaction) {
        const data = interaction.client.tempDeptData?.get(interaction.user.id);

        if (!data) return interaction.update({ content: '❌ Erro de sessão.', components: [] });

        if (data.selectedIds.length === 0) {
            return interaction.reply({ content: '⚠️ Selecione pelo menos um cargo no menu acima antes de salvar.', ephemeral: true });
        }

        try {
            // Salva JSONB
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
            if(!interaction.replied) await interaction.reply({ content: '❌ Erro DB.', ephemeral: true });
        }
    }
};