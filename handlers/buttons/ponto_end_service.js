// handlers/buttons/ponto_end_service.js
const { EmbedBuilder } = require('discord.js');
const db = require('../../database.js');
const { formatDuration } = require('../../utils/formatDuration.js');
const generatePontoDashboard = require('../../ui/pontoDashboardPessoal.js');

module.exports = {
    customId: 'ponto_end_service',
    async execute(interaction) {
        if (interaction.client.pontoIntervals.has(interaction.user.id)) {
            clearInterval(interaction.client.pontoIntervals.get(interaction.user.id));
            interaction.client.pontoIntervals.delete(interaction.user.id);
        }
        
        // Usando interaction.update() diretamente para o dashboard, então não precisamos do deferReply aqui.
        // O deferUpdate() será usado dentro da lógica.
        // await interaction.deferReply({ ephemeral: true });

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        if (!settings?.ponto_status) {
            return interaction.reply({ content: '❌ O sistema de bate-ponto está desativado.', ephemeral: true });
        }

        const activeSession = (await db.query('SELECT * FROM ponto_sessions WHERE user_id = $1 AND guild_id = $2', [interaction.user.id, interaction.guild.id])).rows[0];
        if (!activeSession) {
            return interaction.reply({ content: '⚠️ Você não está em serviço.', ephemeral: true });
        }
        
        // Adia a atualização aqui, pois sabemos que a interação é válida
        await interaction.deferUpdate();
        
        const role = await interaction.guild.roles.fetch(settings.ponto_cargo_em_servico).catch(() => null);
        if (role) {
            await interaction.member.roles.remove(role).catch(err => console.error("Não foi possível remover o cargo de serviço:", err));
        }

        try {
            const startTime = new Date(activeSession.start_time);
            let endTime = new Date();
            let totalPausedMs = activeSession.total_paused_ms || 0;

            if (activeSession.is_paused) {
                const lastPauseTime = new Date(activeSession.last_pause_time);
                totalPausedMs += (endTime.getTime() - lastPauseTime.getTime());
            }

            const durationMs = (endTime.getTime() - startTime.getTime()) - totalPausedMs;
            const durationFormatted = formatDuration(durationMs);
            
            // CORREÇÃO: Usando a variável correta 'activeSession'
            activeSession.durationMs = durationMs;
            const finalDashboard = generatePontoDashboard(interaction, activeSession, 'finalizado');
            await interaction.editReply(finalDashboard);
            
            const logChannel = await interaction.guild.channels.fetch(settings.ponto_canal_registros);
            const logMessage = await logChannel.messages.fetch(activeSession.log_message_id).catch(() => null);
            
            const finalEmbed = new EmbedBuilder()
                .setColor('Red')
                .setAuthor({ name: interaction.member.displayName, iconURL: interaction.user.displayAvatarURL() })
                .setTitle('⏹️ Fim de Serviço')
                .setThumbnail(interaction.user.displayAvatarURL())
                .setImage('https://media.discordapp.net/attachments/1310610658844475404/1424391049648017571/E99EBFA9-97D6-42F2-922C-6AC4EEC1651A.png?ex=68e46fca&is=68e31e4a&hm=167f4d74e96a1250138270ac9396faec3eb7ed427afb3490510b4f969b4f1a1f&=&format=webp&quality=lossless') // <-- Lembre-se de alterar sua imagem aqui
                .addFields(
                    { name: 'Membro', value: `${interaction.user}`, inline: true },
                    { name: 'Tempo Total', value: `\`${durationFormatted}\``, inline: true },
                    { name: 'Início', value: `<t:${Math.floor(startTime.getTime() / 1000)}:f>`, inline: false },
                    { name: 'Fim', value: `<t:${Math.floor(endTime.getTime() / 1000)}:f>`, inline: false }
                )
                .setFooter({ text: `ID do Usuário: ${interaction.user.id}` });
            
            if (logMessage) {
                await logMessage.edit({ embeds: [finalEmbed] });
            } else {
                await logChannel.send({ embeds: [finalEmbed] });
            }

            await db.query('DELETE FROM ponto_sessions WHERE session_id = $1', [activeSession.session_id]);

            await db.query(`
                INSERT INTO ponto_leaderboard (guild_id, user_id, total_ms)
                VALUES ($1, $2, $3)
                ON CONFLICT (guild_id, user_id)
                DO UPDATE SET total_ms = ponto_leaderboard.total_ms + $3;
            `, [interaction.guild.id, interaction.user.id, durationMs]);

        } catch (error) {
            console.error("Erro ao finalizar serviço:", error);
            await interaction.followUp({ content: '❌ Ocorreu um erro ao finalizar seu serviço.', ephemeral: true }).catch(()=>{});
        }
    }
};