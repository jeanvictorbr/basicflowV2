// Crie em: handlers/selects/select_ticket_department_role.js
const db = require('../../database.js');
const generateDepartmentsMenu = require('../../ui/ticketsDepartmentsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    // Usamos um prefixo para que o handler principal (index.js) possa encontrá-lo
    customId: 'select_ticket_department_role_', 
    async execute(interaction) {
        await interaction.deferUpdate();

        const baseCustomId = 'select_ticket_department_role_';
        const encodedData = interaction.customId.substring(baseCustomId.length);
        const jsonData = decodeURIComponent(encodedData);
        const departmentData = JSON.parse(jsonData);

        const roleId = interaction.values[0];

        await db.query(
            'INSERT INTO ticket_departments (guild_id, name, description, emoji, role_id) VALUES ($1, $2, $3, $4, $5)',
            [interaction.guild.id, departmentData.n, departmentData.d, departmentData.e, roleId]
        );

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const departments = (await db.query('SELECT * FROM ticket_departments WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;

        await interaction.editReply({
            components: generateDepartmentsMenu(settings, departments),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};