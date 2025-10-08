// handlers/buttons/open_guardian_menu.js
const db = require('../../database.js');
const generateGuardianAiMenu = require('../../ui/guardianAiMenu.js');
const hasFeature = require('../../utils/featureCheck.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'open_guardian_menu',
    async execute(interaction) {
        if (!await hasFeature(interaction.guild.id, 'GUARDIAN_AI')) {
            return interaction.reply({ content: 'Esta é uma funcionalidade premium.', ephemeral: true });
        }
        await interaction.deferUpdate();
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        await interaction.editReply({
            components: generateGuardianAiMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};