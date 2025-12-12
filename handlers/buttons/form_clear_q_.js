const db = require('../../database.js');
const { getFormBuilderPanel } = require('../../ui/forms/formBuilderUI.js');
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'form_clear_q_',
    async execute(interaction) {
        const customId = interaction.customId.split('form_clear_q_')[1];
        
        await db.query('UPDATE forms_templates SET questions = $1 WHERE guild_id = $2 AND custom_id = $3', ['[]', interaction.guild.id, customId]);
        
        // Recarrega UI
        const form = await db.query('SELECT * FROM forms_templates WHERE guild_id = $1 AND custom_id = $2', [interaction.guild.id, customId]);
        const data = form.rows[0];
        
        const ui = getFormBuilderPanel({ 
            customId: data.custom_id, title: data.title, 
            questions: [], logChannelId: data.log_channel_id, approvedRoleId: data.approved_role_id 
        });

        await interaction.update({ components: ui.components, flags: V2_FLAG });
    }
};