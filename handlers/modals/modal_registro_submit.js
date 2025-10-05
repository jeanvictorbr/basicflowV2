// handlers/modals/modal_registro_submit.js
const db = require('../../database.js');
const generateAprovacao = require('../../ui/registroAprovacaoEmbed.js');

module.exports = {
    customId: 'modal_registro_submit',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        const settings = settingsResult.rows[0];

        if (!settings || !settings.registros_canal_aprovacoes) {
            return interaction.editReply({ content: 'O sistema de registros não está configurado corretamente. Contate um administrador.' });
        }

        const canalAprovacoes = await interaction.guild.channels.fetch(settings.registros_canal_aprovacoes).catch(() => null);
        if (!canalAprovacoes) {
            return interaction.editReply({ content: 'O canal de aprovações configurado não foi encontrado. Contate um administrador.' });
        }

        const nomeRp = interaction.fields.getTextInputValue('input_nome_rp');
        const idRp = interaction.fields.getTextInputValue('input_id_rp');

        try {
            const fichaEmbed = generateAprovacao(interaction.member, nomeRp, idRp);
            const fichaMessage = await canalAprovacoes.send(fichaEmbed);

            // Salva a relação entre a mensagem e o usuário na nova tabela
            await db.query(
                'INSERT INTO pending_registrations (message_id, user_id, guild_id, nome_rp, id_rp) VALUES ($1, $2, $3, $4, $5)',
                [fichaMessage.id, interaction.user.id, interaction.guild.id, nomeRp, idRp]
            );

            await interaction.editReply({ content: '✅ Sua ficha de registro foi enviada para análise!' });
        } catch (error) {
            console.error("Erro ao enviar ficha de registro:", error);
            await interaction.editReply({ content: 'Ocorreu um erro ao enviar sua ficha. Verifique se eu tenho permissões no canal de aprovações.' });
        }
    }
};