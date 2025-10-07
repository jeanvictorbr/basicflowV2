// handlers/modals/modal_guardian_rule_create.js
const db = require('../../database.js');
const generateGuardianRulesMenu = require('../../ui/guardianRulesMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_guardian_rule_create_', // Dinâmico
    async execute(interaction) {
        // Usamos deferUpdate() em vez de deferReply() para editar a mensagem original
        await interaction.deferUpdate(); 
        const triggerType = interaction.customId.split('_')[4];

        const name = interaction.fields.getTextInputValue('input_name');
        const threshold = parseInt(interaction.fields.getTextInputValue('input_threshold'), 10);
        const actionsStr = interaction.fields.getTextInputValue('input_actions').toUpperCase();
        const timeoutDuration = parseInt(interaction.fields.getTextInputValue('input_timeout_duration'), 10) || null;

        if (isNaN(threshold)) {
            return interaction.followUp({ content: 'O valor do limiar deve ser um número.', ephemeral: true });
        }

        const actions = actionsStr.split(',').map(a => a.trim());
        let punishment = 'NONE';
        if (actions.includes('TIMEOUT')) punishment = 'TIMEOUT';
        if (actions.includes('KICK')) punishment = 'KICK';
        if (actions.includes('BAN')) punishment = 'BAN';

        if (punishment === 'TIMEOUT' && (!timeoutDuration || timeoutDuration <= 0)) {
            return interaction.followUp({ content: 'Para a ação TIMEOUT, você deve fornecer uma duração válida em minutos.', ephemeral: true });
        }
        
        await db.query(
            `INSERT INTO guardian_rules (guild_id, name, trigger_type, trigger_threshold, action_delete_message, action_warn_member_dm, action_warn_publicly, action_punishment, action_punishment_duration_minutes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                interaction.guild.id, name, triggerType, threshold,
                actions.includes('DELETAR'), 
                actions.includes('AVISAR_DM'),
                actions.includes('AVISAR_CHAT'),
                punishment, timeoutDuration
            ]
        );
        
        const rules = (await db.query('SELECT * FROM guardian_rules WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        const menuPayload = generateGuardianRulesMenu(rules);
        
        // --- CORREÇÃO APLICADA ---
        // A edição do menu e a mensagem de sucesso agora são feitas em duas etapas separadas
        await interaction.editReply({
            components: menuPayload.components,
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
        
        // Usamos followUp para enviar a confirmação sem causar erro
        await interaction.followUp({ content: '✅ Regra adicionada com sucesso!', ephemeral: true });
    }
};