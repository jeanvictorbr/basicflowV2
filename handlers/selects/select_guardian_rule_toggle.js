// handlers/selects/select_guardian_rule_toggle.js
const db = require('../../database.js');
const generateGuardianRulesMenu = require('../../ui/guardianRulesMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_guardian_rule_toggle',
    async execute(interaction) {
        await interaction.deferUpdate();
        const ruleId = interaction.values[0];
        
        // Atualiza a regra na tabela correta
        await db.query('UPDATE guardian_rules SET is_enabled = NOT is_enabled WHERE id = $1 AND guild_id = $2', [ruleId, interaction.guild.id]);
        
        // Busca a lista ATUALIZADA de regras
        const rules = (await db.query('SELECT * FROM guardian_rules WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        
        // Gera o menu com a lista correta
        const menuPayload = generateGuardianRulesMenu(rules);

        // Atualiza a mensagem com o menu corrigido
        await interaction.editReply({
            components: menuPayload.components,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};