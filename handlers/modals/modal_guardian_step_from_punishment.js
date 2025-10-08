// Crie em: handlers/modals/modal_guardian_step_from_punishment.js
const db = require('../../database.js');
const generatePolicyStepsMenu = require('../../ui/guardianPolicyStepsMenu.js');
const V2_FLAG = 1 << 15; 
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_guardian_step_from_punishment_',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        const [,,,, policyId, punishmentId] = interaction.customId.split('_');
        const threshold = parseInt(interaction.fields.getTextInputValue('input_threshold'), 10);

        if (isNaN(threshold)) {
            return interaction.followUp({ content: 'O valor do limiar deve ser um número.', ephemeral: true });
        }

        const nextStepLevelResult = await db.query('SELECT MAX(step_level) as max FROM guardian_policy_steps WHERE policy_id = $1', [policyId]);
        const nextStepLevel = (nextStepLevelResult.rows[0].max || 0) + 1;

        await db.query(
            `INSERT INTO guardian_policy_steps (policy_id, step_level, threshold, action_punishment) 
             VALUES ($1, $2, $3, $4)`,
            [policyId, nextStepLevel, threshold, punishmentId]
        );

        const policy = (await db.query('SELECT * FROM guardian_policies WHERE id = $1', [policyId])).rows[0];
        const steps = (await db.query('SELECT * FROM guardian_policy_steps WHERE policy_id = $1 ORDER BY step_level ASC', [policyId])).rows;
        const punishments = (await db.query('SELECT * FROM moderation_punishments WHERE guild_id = $1', [interaction.guild.id])).rows;
        
        await interaction.editReply({ 
            components: generatePolicyStepsMenu(policy, steps, punishments),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};