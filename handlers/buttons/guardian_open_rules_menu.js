const db = require('../../database.js');
const generateGuardianPoliciesMenu = require('../../ui/guardianPoliciesMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;
module.exports = {
    customId: 'guardian_open_rules_menu',
    async execute(interaction) {
        await interaction.deferUpdate();
        const policies = (await db.query('SELECT * FROM guardian_policies WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        await interaction.editReply({ components: generateGuardianPoliciesMenu(policies), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};