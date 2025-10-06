// Crie em: handlers/buttons/ponto_confirm_activity.js
const { scheduleAfkCheck } = require('../../utils/afkCheck.js');
const db = require('../../database.js');

module.exports = {
    customId: 'ponto_confirm_activity',
    async execute(interaction) {
        if (interaction.client.afkToleranceTimers.has(interaction.user.id)) {
            clearTimeout(interaction.client.afkToleranceTimers.get(interaction.user.id));
            interaction.client.afkToleranceTimers.delete(interaction.user.id);
            
            await interaction.update({ content: '✅ Atividade confirmada! Seu ponto continua ativo.', components: [] });

            // Reagenda o próximo check
            const settings = (await db.query('SELECT ponto_afk_check_interval_minutes FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
            if (settings) {
                scheduleAfkCheck(interaction.client, interaction.guild.id, interaction.user.id, settings.ponto_afk_check_interval_minutes);
            }
        } else {
            await interaction.update({ content: 'Você não tem uma verificação de atividade pendente ou o tempo já expirou.', components: [] });
        }
    }
};