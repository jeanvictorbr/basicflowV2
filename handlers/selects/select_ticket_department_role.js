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

        // Recupera os dados do departamento que passamos pelo campo 'content'
        const tempData = JSON.parse(interaction.message.content);
        const roleId = interaction.values[0];

        await db.query(
            'INSERT INTO ticket_departments (guild_id, name, description, emoji, role_id) VALUES ($1, $2, $3, $4, $5)',
            [interaction.guild.id, tempData.name, tempData.description, tempData.emoji, roleId]
        );

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const departments = (await db.query('SELECT * FROM ticket_departments WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;

        await interaction.editReply({
            content: null, // Limpa o content após o uso
            components: generateDepartmentsMenu(settings, departments),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};