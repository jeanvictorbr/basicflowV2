const db = require('../../database.js');
const generateGuardianPoliciesMenu = require('../../ui/guardianPoliciesMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;
module.exports = {
    customId: 'select_guardian_policy_toggle',
    async execute(interaction) {
        await interaction.deferUpdate();
        const policyId = interaction.values[0];
        await db.query('UPDATE guardian_policies SET is_enabled = NOT is_enabled WHERE id = $1', [policyId]);
        
        const policies = (await db.query('SELECT * FROM guardian_policies WHERE guild_id = $1 ORDER BY id ASC', [interaction.message.guild.id])).rows;
        await interaction.message.edit({ components: generateGuardianPoliciesMenu(policies), flags: V2_FLAG | EPHEMERAL_FLAG });

        await interaction.deleteReply();
    }
};