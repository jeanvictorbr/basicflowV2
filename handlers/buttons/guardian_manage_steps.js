const db = require('../../database.js');
const generatePolicyStepsMenu = require('../../ui/guardianPolicyStepsMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;
module.exports = {
    customId: 'guardian_manage_steps_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const policyId = interaction.customId.split('_')[3];
        const policy = (await db.query('SELECT * FROM guardian_policies WHERE id = $1', [policyId])).rows[0];
        const steps = (await db.query('SELECT * FROM guardian_policy_steps WHERE policy_id = $1 ORDER BY step_level ASC', [policyId])).rows;
        await interaction.editReply({ components: generatePolicyStepsMenu(policy, steps), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};