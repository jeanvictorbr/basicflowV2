// handlers/buttons/ponto_end_service.js
const { EmbedBuilder } = require('discord.js');
const db = require('../../database.js');
const { formatDuration } = require('../../utils/formatDuration.js');
const generatePontoDashboard = require('../../ui/pontoDashboardPessoal.js');
const generatePontoDashboardV2 = require('../../ui/pontoDashboardPessoalV2.js');

const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'ponto_end_service',
    async execute(interaction) {
        if (interaction.client.pontoIntervals.has(interaction.user.id)) { clearInterval(interaction.client.pontoIntervals.get(interaction.user.id)); interaction.client.pontoIntervals.delete(interaction.user.id); }
        if (interaction.client.afkCheckTimers.has(interaction.user.id)) { clearTimeout(interaction.client.afkCheckTimers.get(interaction.user.id)); interaction.client.afkCheckTimers.delete(interaction.user.id); }
        if (interaction.client.afkToleranceTimers.has(interaction.user.id)) { clearTimeout(interaction.client.afkToleranceTimers.get(interaction.user.id)); interaction.client.afkToleranceTimers.delete(interaction.user.id); }

        // VERIFICAÇÃO DE SEGURANÇA ADICIONADA
        // Verifica se deferUpdate existe E se a interação ainda não foi diferida/respondida
        if (typeof interaction.deferUpdate === 'function' && !interaction.deferred && !interaction.replied) {
            try {
                await interaction.deferUpdate();
            } catch (e) {
                console.warn('Falha ao deferir update no ponto_end_service (pode ser ignorado se for simulação):', e.message);
            }
        }

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        if (!settings?.ponto_status) { 
            // Usa uma função auxiliar segura para responder
            const replyFunc = interaction.editReply || interaction.reply || (() => {});
            return replyFunc.call(interaction, { content: '❌ O sistema de bate-ponto está desativado.', components: [], embeds: [] }); 
        }

        const activeSession = (await db.query('SELECT * FROM ponto_sessions WHERE user_id = $1 AND guild_id = $2', [interaction.user.id, interaction.guild.id])).rows[0];
        if (!activeSession) { 
            const replyFunc = interaction.editReply || interaction.reply || (() => {});
            return replyFunc.call(interaction, { content: '⚠️ Você não está em serviço.', components: [], embeds: [] }); 
        }
        
        const role = await interaction.guild.roles.fetch(settings.ponto_cargo_em_servico).catch(() => null);
        if (role && interaction.member && interaction.member.roles) { 
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
            const durationMs = (endTime.getTime() - startTime.getTime()) - Number(totalPausedMs);
            
            activeSession.durationMs = durationMs;
            
            // Verifica se é uma interação real para atualizar a UI
            // Se for simulação (afk check), interaction.message pode não existir ou ser diferente
            if (interaction.message) {
                const finalDashboardPayload = settings.ponto_dashboard_v2_enabled
                    ? { components: generatePontoDashboardV2(interaction, settings, activeSession, 'finalizado'), flags: V2_FLAG }
                    : generatePontoDashboard(interaction, activeSession, 'finalizado');
                
                if (interaction.editReply) await interaction.editReply(finalDashboardPayload);
            }
            
            const logChannel = await interaction.guild.channels.fetch(settings.ponto_canal_registros).catch(() => null);
            if (logChannel) {
                const logMessage = activeSession.log_message_id ? await logChannel.messages.fetch(activeSession.log_message_id).catch(() => null) : null;
                
                const finalEmbed = new EmbedBuilder().setColor('Red').setAuthor({ name: interaction.member.displayName, iconURL: interaction.user.displayAvatarURL() }).setTitle('⏹️ Fim de Serviço').setThumbnail(interaction.user.displayAvatarURL()).setImage(settings.ponto_imagem_vitrine || null).addFields({ name: 'Membro', value: `${interaction.user}`, inline: true }, { name: 'Tempo Total', value: `\`${formatDuration(durationMs)}\``, inline: true }, { name: 'Início', value: `<t:${Math.floor(startTime.getTime() / 1000)}:f>`, inline: false }, { name: 'Fim', value: `<t:${Math.floor(endTime.getTime() / 1000)}:f>`, inline: false }).setFooter({ text: `ID do Usuário: ${interaction.user.id}` });
                
                if (logMessage) await logMessage.edit({ embeds: [finalEmbed] });
                else await logChannel.send({ embeds: [finalEmbed] });
            }

            await db.query('DELETE FROM ponto_sessions WHERE session_id = $1', [activeSession.session_id]);
            
            await db.query(`
                INSERT INTO ponto_leaderboard (guild_id, user_id, total_ms)
                VALUES ($1, $2, $3)
                ON CONFLICT (guild_id, user_id)
                DO UPDATE SET total_ms = COALESCE(ponto_leaderboard.total_ms, 0) + $3;
            `, [interaction.guild.id, interaction.user.id, durationMs]);
            
            await db.query(
                'INSERT INTO ponto_history (guild_id, user_id, start_time, end_time, duration_ms) VALUES ($1, $2, $3, $4, $5)',
                [interaction.guild.id, interaction.user.id, startTime, endTime, durationMs]
            );

        } catch (error) {
            console.error("Erro ao finalizar serviço:", error);
            // Tenta avisar apenas se possível
            if (interaction.followUp) {
                await interaction.followUp({ content: '❌ Ocorreu um erro ao finalizar seu serviço.', ephemeral: true }).catch(()=>{});
            }
        }
    }
};