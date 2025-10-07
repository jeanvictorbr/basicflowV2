// Crie em: handlers/buttons/guardian_open_rules_menu.js
const db = require('../../database.js');
const generateGuardianRulesMenu = require('../../ui/guardianRulesMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'guardian_open_rules_menu',
    async execute(interaction) {
        await interaction.deferUpdate();
        const rules = (await db.query('SELECT * FROM guardian_rules WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        await interaction.editReply({
            components: generateGuardianRulesMenu(rules),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};