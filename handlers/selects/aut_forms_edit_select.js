const db = require('../../database.js');
const { getFormBuilderPanel } = require('../../ui/forms/formBuilderUI.js');
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'aut_forms_edit_select',
    async execute(interaction) {
        const customId = interaction.values[0];
        const form = await db.query('SELECT * FROM forms_templates WHERE guild_id = $1 AND custom_id = $2', [interaction.guild.id, customId]);
        
        if (form.rows.length === 0) return interaction.update({ components: [{ type: 10, content: "Formulário não encontrado.", style: 3 }] });

        const data = form.rows[0];
        const ui = getFormBuilderPanel({ 
            customId: data.custom_id, 
            title: data.title, 
            questions: data.questions, 
            logChannelId: data.log_channel_id,
            approvedRoleId: data.approved_role_id 
        });

        await interaction.update({ components: ui.components, flags: V2_FLAG });
    }
};