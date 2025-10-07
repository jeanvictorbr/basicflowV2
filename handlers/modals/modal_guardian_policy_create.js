// handlers/modals/modal_guardian_policy_create.js
const db = require('../../database.js');
const generateGuardianPoliciesMenu = require('../../ui/guardianPoliciesMenu.js');
const V2_FLAG = 1 << 15; 
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_guardian_policy_create',
    async execute(interaction) {
        await interaction.deferUpdate();
        const name = interaction.fields.getTextInputValue('input_name');
        const trigger = interaction.fields.getTextInputValue('input_trigger').toUpperCase();
        const resetHours = parseInt(interaction.fields.getTextInputValue('input_reset_hours'), 10) || 24;

        await db.query(`
            INSERT INTO guardian_policies (guild_id, name, trigger_type, reset_interval_hours) 
            VALUES ($1, $2, $3, $4)`, 
            [interaction.guild.id, name, trigger, resetHours]
        );

        const policies = (await db.query('SELECT * FROM guardian_policies WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        
        await interaction.editReply({ 
            components: generateGuardianPoliciesMenu(policies), 
            flags: V2_FLAG | EPHEMERAL_FLAG 
        });
    }
};