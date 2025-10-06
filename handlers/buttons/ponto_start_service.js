// Crie/Substitua em: handlers/buttons/ponto_start_service.js
const { EmbedBuilder } = require('discord.js');
const db = require('../../database.js');
const generatePontoDashboard = require('../../ui/pontoDashboardPessoal.js');

module.exports = {
    customId: 'ponto_start_service',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        if (!settings?.ponto_status || !settings?.ponto_canal_registros || !settings?.ponto_cargo_em_servico) {
            return interaction.editReply({ content: '❌ O sistema de bate-ponto está desativado ou mal configurado. Contate um administrador.' });
        }

        const activeSession = (await db.query('SELECT * FROM ponto_sessions WHERE user_id = $1 AND guild_id = $2', [interaction.user.id, interaction.guild.id])).rows[0];
        if (activeSession) {
            return interaction.editReply({ content: '⚠️ Você já está em serviço. Bata o ponto de saída para finalizar.' });
        }
        
        const role = await interaction.guild.roles.fetch(settings.ponto_cargo_em_servico).catch(() => null);
        if (!role) {
            return interaction.editReply({ content: '❌ O cargo "Em Serviço" não foi encontrado. Contate um administrador.' });
        }

        try {
            await interaction.member.roles.add(role);
            
            const logChannel = await interaction.guild.channels.fetch(settings.ponto_canal_registros);
            const startTime = new Date();

            const entryEmbed = new EmbedBuilder()
                .setColor('Green')
                .setAuthor({ name: interaction.member.displayName, iconURL: interaction.user.displayAvatarURL() })
                .setTitle('▶️ Entrada de Serviço')
                .addFields(
                    { name: 'Membro', value: `${interaction.user}`, inline: true },
                    { name: 'Início', value: `<t:${Math.floor(startTime.getTime() / 1000)}:f>`, inline: true }
                )
                .setFooter({ text: `ID do Usuário: ${interaction.user.id}` });

            const logMessage = await logChannel.send({ embeds: [entryEmbed] });

            const sessionResult = await db.query(
                'INSERT INTO ponto_sessions (guild_id, user_id, start_time, log_message_id) VALUES ($1, $2, $3, $4) RETURNING *',
                [interaction.guild.id, interaction.user.id, startTime, logMessage.id]
            );
            const session = sessionResult.rows[0];

            const dashboardPayload = generatePontoDashboard(interaction, session);
            const dashboardMessage = await interaction.editReply({ ...dashboardPayload, fetchReply: true });
            await db.query('UPDATE ponto_sessions SET dashboard_message_id = $1 WHERE session_id = $2', [dashboardMessage.id, session.session_id]);
            
            const interval = setInterval(async () => {
                const currentSession = (await db.query('SELECT * FROM ponto_sessions WHERE session_id = $1', [session.session_id])).rows[0];
                if (!currentSession) { // Se a sessão foi deletada (fim de serviço)
                    clearInterval(interaction.client.pontoIntervals.get(interaction.user.id));
                    interaction.client.pontoIntervals.delete(interaction.user.id);
                    return;
                }
                if (currentSession.is_paused) return; // Não atualiza se estiver pausado
                
                try {
                    const updatedDashboard = generatePontoDashboard(interaction, currentSession);
                    await interaction.editReply(updatedDashboard).catch(() => {});
                } catch (error) {
                    if (error.code === 10008) { // Mensagem deletada ou expirada
                        clearInterval(interaction.client.pontoIntervals.get(interaction.user.id));
                        interaction.client.pontoIntervals.delete(interaction.user.id);
                    } else {
                        console.error("Erro ao atualizar dashboard de ponto:", error);
                    }
                }
            }, 10000); // 10 segundos

            interaction.client.pontoIntervals.set(interaction.user.id, interval);

        } catch (error) {
            console.error("Erro ao iniciar serviço:", error);
            await interaction.editReply({ content: '❌ Ocorreu um erro. Verifique se tenho permissão para gerenciar cargos e enviar mensagens no canal de logs.' }).catch(()=>{});
        }
    }
};