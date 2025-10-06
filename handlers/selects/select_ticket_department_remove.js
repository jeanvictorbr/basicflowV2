// Crie em: handlers/selects/select_ticket_department_remove.js
const db = require('../../database.js');
const generateDepartmentsMenu = require('../../ui/ticketsDepartmentsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_ticket_department_remove',
    async execute(interaction) {
        await interaction.deferUpdate();
        const departmentId = interaction.values[0];
        
        await db.query('DELETE FROM ticket_departments WHERE id = $1 AND guild_id = $2', [departmentId, interaction.guild.id]);

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const departments = (await db.query('SELECT * FROM ticket_departments WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;

        await interaction.editReply({
            components: generateDepartmentsMenu(settings, departments),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};