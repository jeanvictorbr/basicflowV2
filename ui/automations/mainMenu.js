// ui/automations/mainMenu.js
const db = require('../../database');
const hasFeature = require('../../utils/featureCheck.js');

async function buildAutomationsMenu(interaction) {

    // 1. Busca configurações gerais da guild
    let isEnabled = false;
    try {
        const { rows } = await db.query('SELECT enabled FROM automations_settings WHERE guild_id = $1', [interaction.guild.id]);
        if (rows[0]) isEnabled = rows[0].enabled;
    } catch (e) {
        const guildDb = await db.getGuild(interaction.guild.id);
        if (guildDb) isEnabled = guildDb.automations_enabled;
    }

    // 2. Busca contagem de anúncios ativos
    const { rows: announcements } = await db.query('SELECT COUNT(*) as count FROM automations_announcements WHERE guild_id = $1 AND enabled = true', [interaction.guild.id]);
    const activeAnnouncements = announcements[0] ? announcements[0].count : 0;

    // 3. Busca contagem de sorteios ativos
    let activeGiveaways = 0;
    try {
        const { rows: giveaways } = await db.query("SELECT COUNT(*) as count FROM automations_giveaways WHERE guild_id = $1 AND status = 'active'", [interaction.guild.id]);
        activeGiveaways = giveaways[0] ? giveaways[0].count : 0;
    } catch (e) {
        // Tabela pode não existir
    }
    
    // 4. Verifica a feature
    const hasCloudFlow = await hasFeature(interaction.guild.id, 'AUTOMATIONS'); 

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
                        type: 2, style: 2,
                        label: 'Gerenciar',
                        emoji: { name: '📣' }, custom_id: 'automations_manage_announcements',
                        disabled: !isEnabled
                    },
                    components: [
                        { type: 10, content: "📣 Anúncios Agendados" },
                        { type: 10, content: `Configure mensagens para serem enviadas automaticamente. Ativos: \`${activeAnnouncements}\`` }
                    ]
                },

                // --- Seção de Sorteios ---
                { type: 14, divider: true, spacing: 2 },
                {
                    type: 9,
                    accessory: {
                        type: 2, style: 2,
                        label: 'Gerenciar',
                        emoji: { name: '🎉' }, custom_id: 'aut_gw_menu',
                        disabled: !isEnabled
                    },
                    components: [
                        { type: 10, content: "🎉 Sorteios & Giveaways" },
                        { type: 10, content: `Crie e gerencie sorteios automáticos para sua comunidade. Ativos: \`${activeGiveaways}\`` }
                    ]
                },

                // --- Seção CloudFlow ---
                { type: 14, divider: true, spacing: 2 },
                {
                    type: 9,
                    accessory: {
                        type: 2, style: 2,
                        label: 'Abrir',
                        emoji: { name: '☁️' }, custom_id: 'aut_open_cloudflow_menu',
                        disabled: !isEnabled || !hasCloudFlow
                    },
                    components: [
                        { type: 10, content: "☁️ CloudFlow " },
                        { type: 10, content: `Verificação OAuth2 e Backups de Servidor.` }
                    ]
                },
                
                // ----------------- NOVA ADIÇÃO (Cargos em Massa) -----------------
                { type: 14, divider: true, spacing: 2 },
                {
                    type: 9,
                    accessory: {
                        type: 2, style: 2, // Style 2 (cinza)
                        label: 'Abrir',
                        emoji: { name: '🏷️' }, custom_id: 'aut_mass_roles_menu',
                        disabled: !isEnabled
                    },
                    components: [
                        { type: 10, content: "🏷️ Cargos em Massa" },
                        { type: 10, content: `Adicione ou remova cargos de todos os membros do servidor de uma vez.` }
                    ]
                },
                // --- [NOVO] Auto-Purge ---
                { type: 14, divider: true, spacing: 2 },
                {
                    type: 9,
                    accessory: {
                        type: 2, style: 2, // Style 2 (Cinza)
                        label: 'Configurar',
                        emoji: { name: '🧹' }, 
                        custom_id: 'aut_purge_menu', // Aponta para o handler criado anteriormente
                        disabled: !isEnabled
                    },
                    components: [
                        { type: 10, content: "🧹 Auto-Purge (Limpeza)" },
                        { type: 10, content: `Limpeza automática de mensagens antigas em canais específicos.` }
                    ]
                },
                // -----------------------------------------------------------------
                
                // --- Rodapé e Controles ---
                { type: 14, divider: true, spacing: 2 }, 
                {
                    type: 1,
                    components: [
                        { // Este é o components[10].components[0]
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