// handlers/buttons/ponto_start_service.js
const { EmbedBuilder } = require('discord.js');
const db = require('../../database.js');
const generatePontoDashboard = require('../../ui/pontoDashboardPessoal.js');
const generatePontoDashboardV2 = require('../../ui/pontoDashboardPessoalV2.js');
const { scheduleAfkCheck } = require('../../utils/afkCheck.js');

const V2_FLAG = 1 << 15; // Flag adicionada para corrigir o erro

module.exports = {
    customId: 'ponto_start_service',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        if (!settings?.ponto_status || !settings?.ponto_canal_registros || !settings?.ponto_cargo_em_servico) {
            return interaction.editReply({ content: '❌ O sistema de bate-ponto está desativado ou mal configurado.' });
        }

        const activeSession = (await db.query('SELECT * FROM ponto_sessions WHERE user_id = $1 AND guild_id = $2', [interaction.user.id, interaction.guild.id])).rows[0];
        if (activeSession) { return interaction.editReply({ content: '⚠️ Você já está em serviço.' }); }
        
        const role = await interaction.guild.roles.fetch(settings.ponto_cargo_em_servico).catch(() => null);
        if (!role) { return interaction.editReply({ content: '❌ O cargo "Em Serviço" não foi encontrado.' }); }

        try {
            await interaction.member.roles.add(role);
            const logChannel = await interaction.guild.channels.fetch(settings.ponto_canal_registros);
            const startTime = new Date();

            const entryEmbed = new EmbedBuilder().setColor('Green').setAuthor({ name: interaction.member.displayName, iconURL: interaction.user.displayAvatarURL() }).setTitle('▶️ Entrada de Serviço').addFields({ name: 'Membro', value: `${interaction.user}`, inline: true }, { name: 'Início', value: `<t:${Math.floor(startTime.getTime() / 1000)}:f>`, inline: true }).setFooter({ text: `ID do Usuário: ${interaction.user.id}` });
            const logMessage = await logChannel.send({ embeds: [entryEmbed] });

            const sessionResult = await db.query('INSERT INTO ponto_sessions (guild_id, user_id, start_time, log_message_id) VALUES ($1, $2, $3, $4) RETURNING *', [interaction.guild.id, interaction.user.id, startTime, logMessage.id]);
            const session = sessionResult.rows[0];

            const useV2 = settings.ponto_dashboard_v2_enabled;
            const dashboardPayload = useV2 ? { components: generatePontoDashboardV2(interaction, settings, session), flags: V2_FLAG } : generatePontoDashboard(interaction, session);

            const dashboardMessage = await interaction.editReply({ ...dashboardPayload, fetchReply: true });
            await db.query('UPDATE ponto_sessions SET dashboard_message_id = $1 WHERE session_id = $2', [dashboardMessage.id, session.session_id]);
            
            const interval = setInterval(async () => {
                const currentSession = (await db.query('SELECT * FROM ponto_sessions WHERE session_id = $1', [session.session_id])).rows[0];
                if (!currentSession || currentSession.is_paused) return;
                
                try {
                    const updatedPayload = useV2 ? { components: generatePontoDashboardV2(interaction, settings, currentSession), flags: V2_FLAG } : generatePontoDashboard(interaction, currentSession);
                    await interaction.editReply(updatedPayload).catch(() => {});
                } catch (error) {
                    if (error.code === 10008) {
                        clearInterval(interaction.client.pontoIntervals.get(interaction.user.id));
                        interaction.client.pontoIntervals.delete(interaction.user.id);
                    }
                }
            }, 10000);

            interaction.client.pontoIntervals.set(interaction.user.id, interval);
            
            if (settings.ponto_afk_check_enabled) {
                scheduleAfkCheck(interaction.client, interaction.guild.id, interaction.user.id, settings.ponto_afk_check_interval_minutes);
            }
        } catch (error) {
            console.error("Erro ao iniciar serviço:", error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao iniciar seu serviço.' }).catch(()=>{});
        }
    }
};