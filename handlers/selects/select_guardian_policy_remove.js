// Substitua em: handlers/selects/select_guardian_policy_remove.js
const db = require('../../database.js');
const generateGuardianPoliciesMenu = require('../../ui/guardianPoliciesMenu.js');
const V2_FLAG = 1 << 15; 
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_guardian_policy_remove',
    async execute(interaction) {
        await interaction.deferUpdate();
        const policyId = interaction.values[0];

        await db.query('DELETE FROM guardian_policy_steps WHERE policy_id = $1', [policyId]);
        await db.query('DELETE FROM guardian_policies WHERE id = $1', [policyId]);
        await db.query('DELETE FROM guardian_infractions WHERE policy_id = $1', [policyId]);
        
        const policies = (await db.query('SELECT * FROM guardian_policies WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        
        // CORREÇÃO: Usa editReply() para atualizar o menu que agora está na mesma mensagem.
        await interaction.editReply({ 
            components: generateGuardianPoliciesMenu(policies), 
            flags: V2_FLAG | EPHEMERAL_FLAG 
        });
    }
};