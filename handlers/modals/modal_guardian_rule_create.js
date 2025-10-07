// Crie em: handlers/modals/modal_guardian_rule_create.js
const db = require('../../database.js');
const generateGuardianRulesMenu = require('../../ui/guardianRulesMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_guardian_rule_create_', // Dinâmico
    async execute(interaction) {
        await interaction.deferUpdate();
        const triggerType = interaction.customId.split('_')[4];

        const name = interaction.fields.getTextInputValue('input_name');
        const threshold = parseInt(interaction.fields.getTextInputValue('input_threshold'), 10);
        const actionsStr = interaction.fields.getTextInputValue('input_actions').toUpperCase();

        if (isNaN(threshold)) {
            return interaction.followUp({ content: 'O valor do limiar deve ser um número.', ephemeral: true });
        }

        const actions = actionsStr.split(',').map(a => a.trim());
        const punishmentMap = {
            'TIMEOUT_5': 'TIMEOUT_5_MIN',
            'TIMEOUT_30': 'TIMEOUT_30_MIN',
            'KICK': 'KICK',
        };
        const punishment = Object.keys(punishmentMap).find(key => actions.includes(key)) ? punishmentMap[Object.keys(punishmentMap).find(key => actions.includes(key))] : 'NONE';

        await db.query(
            `INSERT INTO guardian_rules (guild_id, name, trigger_type, trigger_threshold, action_delete_message, action_warn_member_dm, action_punishment)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                interaction.guild.id,
                name,
                triggerType,
                threshold,
                actions.includes('DELETAR'),
                actions.includes('AVISAR'),
                punishment
            ]
        );
        
        const rules = (await db.query('SELECT * FROM guardian_rules WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        await interaction.editReply({
            content: null,
            embeds: [],
            components: generateGuardianRulesMenu(rules),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};