// handlers/buttons/guardian_step_remove.js
const db = require('../../database.js');
const generatePolicyStepsMenu = require('../../ui/guardianPolicyStepsMenu.js');
const generateGuardianPoliciesMenu = require('../../ui/guardianPoliciesMenu.js'); // <-- ADIÇÃO DA IMPORTAÇÃO CORRETA
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'guardian_step_remove_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const policyId = interaction.customId.split('_')[3];

        const maxStepResult = await db.query('SELECT MAX(step_level) as max FROM guardian_policy_steps WHERE policy_id = $1', [policyId]);
        const maxStepLevel = maxStepResult.rows[0]?.max;

        if (maxStepLevel) {
            await db.query('DELETE FROM guardian_policy_steps WHERE policy_id = $1 AND step_level = $2', [policyId, maxStepLevel]);
        }

        const policy = (await db.query('SELECT * FROM guardian_policies WHERE id = $1', [policyId])).rows[0];
        
        if (!policy) {
            // Se a política não for encontrada (ex: foi deletada), retorna ao menu de políticas
            const allPolicies = (await db.query('SELECT * FROM guardian_policies WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
            return interaction.editReply({ 
                components: generateGuardianPoliciesMenu(allPolicies),
                flags: V2_FLAG | EPHEMERAL_FLAG 
            });
        }
        
        // Se a política ainda existe, atualiza o menu de passos
        const steps = (await db.query('SELECT * FROM guardian_policy_steps WHERE policy_id = $1 ORDER BY step_level ASC', [policyId])).rows;
        const punishments = (await db.query('SELECT * FROM moderation_punishments WHERE guild_id = $1', [interaction.guild.id])).rows;
        
        await interaction.editReply({ 
            components: generatePolicyStepsMenu(policy, steps, punishments),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};