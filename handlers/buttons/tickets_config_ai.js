// Crie em: handlers/buttons/tickets_config_ai.js
const db = require('../../database.js');
const generateAiMenu = require('../../ui/ticketsAiMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'tickets_config_ai',
    async execute(interaction) {
        await interaction.deferUpdate();
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        await interaction.editReply({
            components: generateAiMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};