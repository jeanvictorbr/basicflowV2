// Substitua em: handlers/buttons/guardian_manage_steps.js
const db = require('../../database.js');
const generatePolicyStepsMenu = require('../../ui/guardianPolicyStepsMenu.js');
const generateGuardianPoliciesMenu = require('../../ui/guardianPoliciesMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'guardian_manage_steps_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const policyId = interaction.customId.split('_')[3];
        const policy = (await db.query('SELECT * FROM guardian_policies WHERE id = $1', [policyId])).rows[0];

        // CORREÇÃO: Adiciona uma verificação para o caso da política ter sido removida.
        if (!policy) {
            await interaction.followUp({ content: 'Esta política não existe mais.', ephemeral: true });
            const policies = (await db.query('SELECT * FROM guardian_policies WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
            return interaction.editReply({ 
                components: generateGuardianPoliciesMenu(policies),
                flags: V2_FLAG | EPHEMERAL_FLAG 
            });
        }

        const steps = (await db.query('SELECT * FROM guardian_policy_steps WHERE policy_id = $1 ORDER BY step_level ASC', [policyId])).rows;
        const punishments = (await db.query('SELECT * FROM moderation_punishments WHERE guild_id = $1', [interaction.guild.id])).rows;

        await interaction.editReply({
            components: generatePolicyStepsMenu(policy, steps, punishments),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};