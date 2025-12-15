const db = require('../../database.js');
const pontoDashboard = require('../../ui/pontoDashboardPessoalV2.js');

module.exports = {
    customId: 'ponto_meu_status',
    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const result = await db.query(`
            SELECT * FROM ponto_sessions 
            WHERE user_id = $1 AND guild_id = $2 AND (status = 'OPEN' OR status IS NULL)
        `, [userId, guildId]);

        if (result.rows.length === 0) {
            return interaction.reply({ content: "❌ Nenhuma sessão ativa.", flags: 1 << 6 });
        }

        const ui = pontoDashboard(result.rows[0], interaction.member);
        await interaction.update(ui);
    }
};