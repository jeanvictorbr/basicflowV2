// ui/devPanel/healthCheckMenu.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateHealthCheckMenu(stats) {
    const V2_FLAG = 1 << 15;
    const EPHEMERAL_FLAG = 1 << 6;

    function formatUptime(seconds) {
        if (!seconds) return 'N/A';
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor(seconds % (3600 * 24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 60);
        return `${d}d ${h}h ${m}m ${s}s`;
    }

    const mainControls = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('dev_open_health_check')
                .setLabel('Atualizar Dados')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🔄'),
            new ButtonBuilder()
                .setCustomId('dev_main_menu_back')
                .setLabel('Voltar para o Menu')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('↩️')
        );

    const diagnosticControls = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('dev_view_error_log')
                .setLabel('Ver Últimos Erros')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('📄'),
            new ButtonBuilder()
                .setCustomId('dev_view_command_stats')
                .setLabel('Estatísticas de Comandos')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📊')
        );

    return {
        components: [
            {
                type: 17, // Rich Content
                components: [
                    { type: 10, content: "## 🩺 Painel de Saúde do Sistema" },
                    { type: 14, divider: true, spacing: 2 },
                    { type: 10, content: `**🚀 Uptime:** \`${formatUptime(stats.uptime)}\`` },
                    { type: 10, content: `**💓 Latência da API:** \`${stats.apiLatency}ms\`` },
                    { type: 10, content: `**💻 Uso de RAM:** \`${stats.ramUsage} MB\`` },
                    { type: 14, divider: true, spacing: 2 },
                    { type: 1, components: diagnosticControls.toJSON().components },
                    { type: 1, components: mainControls.toJSON().components }
                ]
            }
        ],
        flags: V2_FLAG | EPHEMERAL_FLAG,
    };
};