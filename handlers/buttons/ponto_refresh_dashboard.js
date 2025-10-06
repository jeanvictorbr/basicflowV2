// Crie em: handlers/buttons/ponto_refresh_dashboard.js
const db = require('../../database.js');
const generatePontoDashboardV2 = require('../../ui/pontoDashboardPessoalV2.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'ponto_refresh_dashboard',
    async execute(interaction) {
        const session = (await db.query('SELECT * FROM ponto_sessions WHERE user_id = $1 AND guild_id = $2', [interaction.user.id, interaction.guild.id])).rows[0];
        if (!session) {
            return interaction.reply({ content: 'Você não está mais em serviço.', ephemeral: true });
        }
        
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const dashboard = generatePontoDashboardV2(interaction, settings, session);
        await interaction.update({ components: dashboard, flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};