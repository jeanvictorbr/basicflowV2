// Crie em: handlers/modals/modal_ausencia_submit.js
const db = require('../../database.js');
const generateAusenciaAprovacao = require('../../ui/ausenciaAprovacaoEmbed.js');

module.exports = {
    customId: 'modal_ausencia_submit',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        if (!settings?.ausencias_canal_aprovacoes) {
            return interaction.editReply({ content: 'O sistema de ausências não está configurado. Contate um administrador.' });
        }

        const canalAprovacoes = await interaction.guild.channels.fetch(settings.ausencias_canal_aprovacoes).catch(() => null);
        if (!canalAprovacoes) {
            return interaction.editReply({ content: 'O canal de aprovações configurado não foi encontrado.' });
        }

        const startDate = interaction.fields.getTextInputValue('input_start_date');
        const endDate = interaction.fields.getTextInputValue('input_end_date');
        const reason = interaction.fields.getTextInputValue('input_reason');

        try {
            const fichaEmbed = generateAusenciaAprovacao(interaction.member, startDate, endDate, reason);
            const fichaMessage = await canalAprovacoes.send(fichaEmbed);

            await db.query(
                'INSERT INTO pending_absences (message_id, user_id, guild_id, start_date, end_date, reason) VALUES ($1, $2, $3, $4, $5, $6)',
                [fichaMessage.id, interaction.user.id, interaction.guild.id, startDate, endDate, reason]
            );

            await interaction.editReply({ content: '✅ Sua solicitação de ausência foi enviada para análise!' });
        } catch (error) {
            console.error("Erro ao enviar solicitação de ausência:", error);
            await interaction.editReply({ content: 'Ocorreu um erro ao enviar sua solicitação.' });
        }
    }
};