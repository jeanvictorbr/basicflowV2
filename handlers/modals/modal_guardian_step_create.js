// Substitua o conteúdo em: handlers/modals/modal_guardian_step_create.js
const db = require('../../database.js');
const generatePolicyStepsMenu = require('../../ui/guardianPolicyStepsMenu.js');
const V2_FLAG = 1 << 15; 
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_guardian_step_create_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const policyId = interaction.customId.split('_')[4];

        const threshold = parseInt(interaction.fields.getTextInputValue('input_threshold'), 10);
        const actionsStr = interaction.fields.getTextInputValue('input_actions').toUpperCase();
        const timeoutDuration = parseInt(interaction.fields.getTextInputValue('input_timeout'), 10) || null;
        
        const actions = actionsStr.split(',').map(a => a.trim());
        let punishment = 'NONE';
        if (actions.includes('TIMEOUT')) punishment = 'TIMEOUT';
        if (actions.includes('KICK')) punishment = 'KICK';
        if (actions.includes('BAN')) punishment = 'BAN';

        if (isNaN(threshold)) return interaction.followUp({ content: 'O valor do limiar deve ser um número.', ephemeral: true });
        if (punishment === 'TIMEOUT' && !timeoutDuration) return interaction.followUp({ content: 'Para a ação TIMEOUT, você deve definir uma duração.', ephemeral: true });

        const nextStepLevelResult = await db.query('SELECT MAX(step_level) as max FROM guardian_policy_steps WHERE policy_id = $1', [policyId]);
        const nextStepLevel = (nextStepLevelResult.rows[0].max || 0) + 1;

        await db.query(
            `INSERT INTO guardian_policy_steps (policy_id, step_level, threshold, action_delete_message, action_warn_publicly, action_punishment, action_punishment_duration_minutes) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [policyId, nextStepLevel, threshold, actions.includes('DELETAR'), actions.includes('AVISAR_CHAT'), punishment, timeoutDuration]
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