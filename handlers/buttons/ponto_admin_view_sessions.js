// handlers/buttons/ponto_admin_view_sessions.js
const db = require('../../database.js');
const { formatDuration } = require('../../utils/formatDuration.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'ponto_admin_view_sessions',
    async execute(interaction) {
        await interaction.deferUpdate();

        // Busca todas as sessões ativas nesta guilda
        const sessions = (await db.query('SELECT * FROM ponto_sessions WHERE guild_id = $1 ORDER BY start_time DESC LIMIT 10', [interaction.guild.id])).rows;

        if (sessions.length === 0) {
            return interaction.editReply({ 
                components: [{ type: 17, components: [{ type: 10, content: '✅ **Nenhuma sessão aberta no momento.**' }] }],
                flags: V2_FLAG | EPHEMERAL_FLAG 
            });
        }

        const components = [];
        components.push({ type: 10, content: `## 🚨 Sessões Ativas (${sessions.length})\nUse os botões para encerrar forçadamente.` });

        for (const session of sessions) {
            const startTime = new Date(session.start_time);
            let elapsedTime = Date.now() - startTime.getTime();
            if (session.is_paused) {
                // Cálculo aproximado se estiver pausado
                // (Para precisão exata precisaria da lógica completa, mas aqui é admin view)
                elapsedTime -= parseInt(session.total_paused_ms || 0);
            } else {
                elapsedTime -= parseInt(session.total_paused_ms || 0);
            }

            const statusIcon = session.is_paused ? '⏸️ Pausado' : '▶️ Ativo';
            
            components.push(
                { type: 14, divider: true, spacing: 1 },
                { 
                    type: 10, 
                    content: `**Usuário:** <@${session.user_id}>\n**Início:** <t:${Math.floor(startTime.getTime()/1000)}:R>\n**Status:** ${statusIcon}\n**Tempo Corrente:** \`${formatDuration(elapsedTime)}\`` 
                },
                {
                    type: 1,
                    components: [
                        { 
                            type: 2, 
                            style: 4, 
                            label: "Forçar Finalização", 
                            emoji: { name: "🛑" }, 
                            custom_id: `ponto_force_close_${session.session_id}` 
                        }
                    ]
                }
            );
        }

        await interaction.editReply({
            components: [{ type: 17, components: components }],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};