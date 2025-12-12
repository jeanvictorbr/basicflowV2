const db = require('../../database.js');
const getFormsUI = require('../../ui/automations/formsMain.js');
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'aut_forms_hub',
    async execute(interaction) {
        const res = await db.query('SELECT COUNT(*) FROM forms_templates WHERE guild_id = $1', [interaction.guild.id]);
        const ui = getFormsUI(res.rows[0].count);
        
        await interaction.update({ components: ui.components, flags: V2_FLAG });
    }
};