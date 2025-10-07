// Crie em: handlers/selects/select_guardian_alert_channel.js
const db = require('../../database.js');
const generateGuardianAiMenu = require('../../ui/guardianAiMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_guardian_alert_channel',
    async execute(interaction) {
        await interaction.deferUpdate();
        const channelId = interaction.values[0];
        
        // Se o usuário limpar a seleção, o valor será nulo, desativando a função
        await db.query(`UPDATE guild_settings SET guardian_ai_alert_channel = $1 WHERE guild_id = $2`, [channelId, interaction.guild.id]);

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        await interaction.editReply({
            components: generateGuardianAiMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};