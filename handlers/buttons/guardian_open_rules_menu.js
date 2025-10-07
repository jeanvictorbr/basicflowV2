// handlers/buttons/guardian_open_rules_menu.js
const db = require('../../database.js');
const generateGuardianRulesMenu = require('../../ui/guardianRulesMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'guardian_open_rules_menu',
    async execute(interaction) {
        await interaction.deferUpdate();
        // --- MUDANÇA AQUI ---
        const rules = (await db.query('SELECT * FROM guardian_rules_v2 WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        const menuPayload = generateGuardianRulesMenu(rules);
        await interaction.editReply({
            components: menuPayload.components,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};