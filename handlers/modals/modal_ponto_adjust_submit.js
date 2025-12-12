// handlers/modals/modal_ponto_adjust_submit.js
const db = require('../../database.js');
const { formatDuration } = require('../../utils/formatDuration.js');

module.exports = {
    customId: 'modal_ponto_adjust_submit_', // Dinâmico
    async execute(interaction) {
        const targetUserId = interaction.customId.split('_')[4];
        const input = interaction.fields.getTextInputValue('input_adjustment').toUpperCase().trim();
        const reason = interaction.fields.getTextInputValue('input_reason') || 'Sem motivo';

        await interaction.deferReply({ ephemeral: true });

        let msToAdjust = 0;
        let isReset = false;

        // Parser simples de tempo
        if (input === 'RESET') {
            isReset = true;
        } else {
            const regex = /^([+-])?(\d+)(H|M)?$/; // Captura sinal, valor e unidade
            const match = input.match(regex);

            if (!match) {
                return interaction.editReply('❌ Formato inválido. Use: `+1h`, `-30m`, `+60` (minutos) ou `RESET`.');
            }

            const sign = match[1] || '+';
            const value = parseInt(match[2]);
            const unit = match[3] || 'M'; // Default minutos

            let ms = value * 60 * 1000; // Base minutos
            if (unit === 'H') ms = value * 60 * 60 * 1000;

            msToAdjust = sign === '-' ? -ms : ms;
        }

        try {
            if (isReset) {
                await db.query('DELETE FROM ponto_leaderboard WHERE guild_id = $1 AND user_id = $2', [interaction.guild.id, targetUserId]);
                await db.query('DELETE FROM ponto_history WHERE guild_id = $1 AND user_id = $2', [interaction.guild.id, targetUserId]);
                // Opcional: Fechar sessão ativa também? Geralmente reset apaga histórico.
                
                await interaction.editReply(`✅ O banco de horas do usuário <@${targetUserId}> foi **RESETADO** com sucesso.\n📝 Motivo: ${reason}`);
            } else {
                // Atualiza ou Cria
                const res = await db.query(
                    `INSERT INTO ponto_leaderboard (guild_id, user_id, total_ms) VALUES ($1, $2, $3)
                     ON CONFLICT (guild_id, user_id) DO UPDATE SET total_ms = ponto_leaderboard.total_ms + $3
                     RETURNING total_ms`,
                    [interaction.guild.id, targetUserId, msToAdjust]
                );

                const newTotal = parseInt(res.rows[0].total_ms);
                // Garante que não fique negativo
                if (newTotal < 0) {
                    await db.query('UPDATE ponto_leaderboard SET total_ms = 0 WHERE guild_id = $1 AND user_id = $2', [interaction.guild.id, targetUserId]);
                }

                const actionText = msToAdjust > 0 ? 'adicionado' : 'removido';
                const durationText = formatDuration(Math.abs(msToAdjust));
                
                await interaction.editReply(`✅ Sucesso! Foi **${actionText}** \`${durationText}\` ao tempo de <@${targetUserId}>.\n📝 Motivo: ${reason}`);
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Erro ao atualizar o banco de dados.');
        }
    }
};