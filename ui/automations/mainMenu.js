// ui/automations/mainMenu.js
const db = require('../../database');

async function buildAutomationsMenu(interaction) {

    // 1. Busca configurações gerais da guild
    const { rows } = await db.query('SELECT enabled FROM automations_settings WHERE guild_id = $1', [interaction.guild.id]);
    const settings = rows[0];
    const isEnabled = settings ? settings.enabled : false;

    // 2. Busca contagem de anúncios ativos
    const { rows: announcements } = await db.query('SELECT COUNT(*) as count FROM automations_announcements WHERE guild_id = $1 AND enabled = true', [interaction.guild.id]);
    const activeAnnouncements = announcements[0] ? announcements[0].count : 0;

    // 3. Busca contagem de sorteios ativos (TABELA NOVA)
    let activeGiveaways = 0;
    try {
        const { rows: giveaways } = await db.query("SELECT COUNT(*) as count FROM automations_giveaways WHERE guild_id = $1 AND status = 'active'", [interaction.guild.id]);
        activeGiveaways = giveaways[0] ? giveaways[0].count : 0;
    } catch (e) {
        // Silencia erro caso a tabela ainda não exista na primeira execução
    }

    return [
        {
            type: 17,
            accent_color: 42751,
            components: [
                {
                    type: 10,
                    content: "## ⚙️ Painel de Automatizações"
                },
                {
                    type: 10,
                    content: `Gerencie módulos de automação para seu servidor.\n**Status do Módulo:** ${isEnabled ? '🟢 Ativado' : '🔴 Desativado'}`
                },
                
                // --- Seção de Anúncios ---
                { type: 14, divider: true, spacing: 2 },
                {
                    type: 9,
                    accessory: {
                        type: 2, style: 1, label: 'Gerenciar Anúncios',
                        emoji: { name: '📣' }, custom_id: 'automations_manage_announcements',
                        disabled: !isEnabled
                    },
                    components: [
                        { type: 10, content: "📣 Anúncios Agendados" },
                        { type: 10, content: `Configure mensagens para serem enviadas automaticamente. Ativos: \`${activeAnnouncements}\`` }
                    ]
                },

                // --- Seção de Sorteios (NOVO) ---
                { type: 14, divider: true, spacing: 2 },
                {
                    type: 9,
                    accessory: {
                        type: 2, style: 1, label: 'Gerenciar Sorteios',
                        emoji: { name: '🎉' }, custom_id: 'aut_gw_menu',
                        disabled: !isEnabled
                    },
                    components: [
                        { type: 10, content: "🎉 Sorteios & Giveaways" },
                        { type: 10, content: `Crie e gerencie sorteios automáticos para sua comunidade. Ativos: \`${activeGiveaways}\`` }
                    ]
                },
                
                // --- Rodapé e Controles ---
                { type: 14, divider: true, spacing: 2 }, 
                {
                    type: 1,
                    components: [
                        {
                            type: 2, style: isEnabled ? 4 : 3,
                            label: isEnabled ? 'Desativar Módulo' : 'Ativar Módulo',
                            emoji: { name: isEnabled ? '✖️' : '✔️' },
                            custom_id: 'automations_toggle_system'
                        },
                        {
                            type: 2, style: 2, label: 'Voltar',
                            emoji: { name: '⬅️' }, custom_id: 'main_menu_back'
                        }
                    ]
                }
            ].filter(Boolean)
        }
    ];
}

module.exports = buildAutomationsMenu;