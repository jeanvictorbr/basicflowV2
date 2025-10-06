// Crie em: handlers/modals/modal_department_details.js
const db = require('../../database.js');
const generateDepartmentsMenu = require('../../ui/ticketsDepartmentsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_department_details_', // Handler dinâmico
    async execute(interaction) {
        await interaction.deferUpdate();

        // Extrai o roleId que passamos no customId
        const roleId = interaction.customId.split('_')[3];
        
        const name = interaction.fields.getTextInputValue('input_name');
        const description = interaction.fields.getTextInputValue('input_desc');
        const emoji = interaction.fields.getTextInputValue('input_emoji');

        await db.query(
            'INSERT INTO ticket_departments (guild_id, name, description, emoji, role_id) VALUES ($1, $2, $3, $4, $5)',
            [interaction.guild.id, name, description, emoji, roleId]
        );

        // Atualiza o menu para mostrar o novo departamento
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const departments = (await db.query('SELECT * FROM ticket_departments WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;

        await interaction.editReply({
            components: generateDepartmentsMenu(settings, departments),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};