// ui/automations/mainMenu.js
const db = require('../../database');
const hasFeature = require('../../utils/featureCheck.js');

async function buildAutomationsMenu(interaction, page = 1) {
    const guildId = interaction.guild.id;

    // 1. Status Geral
    let isEnabled = false;
    try {
        const { rows } = await db.query('SELECT enabled FROM automations_settings WHERE guild_id = $1', [guildId]);
        if (rows[0]) isEnabled = rows[0].enabled;
    } catch (e) {}

    // 2. Contagens
    const counts = { announcements: 0, giveaways: 0, forms: 0, button_panels: 0 };
    try {
        const resAnn = await db.query('SELECT COUNT(*) FROM automations_announcements WHERE guild_id = $1 AND enabled = true', [guildId]);
        counts.announcements = resAnn.rows[0].count;
        
        const resGive = await db.query("SELECT COUNT(*) FROM automations_giveaways WHERE guild_id = $1 AND status = 'active'", [guildId]);
        counts.giveaways = resGive.rows[0].count;

        const resForms = await db.query('SELECT COUNT(*) FROM forms_templates WHERE guild_id = $1', [guildId]);
        counts.forms = resForms.rows[0].count;

        // VERIFICAÇÃO DA TABELA DE BOTÕES (Se ela existir no seu banco)
        // Se der erro aqui é pq a tabela button_role_panels nao existe, mas o catch segura.
        const resButtons = await db.query('SELECT COUNT(*) FROM button_role_panels WHERE guild_id = $1', [guildId]);
        counts.button_panels = resButtons.rows[0]?.count || 0;
    } catch (e) {
        // Ignora erro se a tabela ainda não existir
    }

    const hasCloudFlow = await hasFeature(guildId, 'AUTOMATIONS');

    // --- PÁGINA 1 ---
    const itemsPage1 = [
        {
            type: 9, 
            accessory: { type: 2, style: 2, label: 'Gerenciar', emoji: { name: '📣' }, custom_id: 'automations_manage_announcements', disabled: !isEnabled },
            components: [
                { type: 10, content: "📣 Anúncios Agendados" },
                { type: 10, content: `Mensagens automáticas e recorrentes. Ativos: \`${counts.announcements}\`` }
            ]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, 
            accessory: { type: 2, style: 2, label: 'Gerenciar', emoji: { name: '🎉' }, custom_id: 'aut_gw_menu', disabled: !isEnabled },
            components: [
                { type: 10, content: "🎉 Sorteios & Giveaways" },
                { type: 10, content: `Sorteios automáticos com requisitos. Ativos: \`${counts.giveaways}\`` }
            ]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, 
            accessory: { type: 2, style: 2, label: 'Configurar', emoji: { name: '🧹' }, custom_id: 'aut_purge_menu', disabled: !isEnabled },
            components: [
                { type: 10, content: "🧹 Auto-Purge" },
                { type: 10, content: `Limpeza automática de mensagens antigas.` }
            ]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, 
            accessory: { type: 2, style: 2, label: 'Abrir', emoji: { name: '☁️' }, custom_id: 'aut_open_cloudflow_menu', disabled: !isEnabled || !hasCloudFlow },
            components: [
                { type: 10, content: "☁️ CloudFlow (OAuth2)" },
                { type: 10, content: `Verificação de usuários e sistema de backup.` }
            ]
        }
    ];

    // --- PÁGINA 2 ---
    const itemsPage2 = [
        {
            type: 9, 
            accessory: { type: 2, style: 1, label: 'Acessar', emoji: { name: '📝' }, custom_id: 'aut_forms_hub', disabled: !isEnabled },
            components: [
                { type: 10, content: "📝 Formulários & Aplicações" },
                { type: 10, content: `Crie forms de recrutamento ou denúncia. Criados: \`${counts.forms}\`` }
            ]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, 
            accessory: { type: 2, style: 1, label: 'Configurar', emoji: { name: '🔊' }, custom_id: 'aut_voice_hub', disabled: !isEnabled },
            components: [
                { type: 10, content: "🔊 Hub de Voz Temporário" },
                { type: 10, content: `Canais de voz "Join-to-Create" com painel de controle.` }
            ]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            // [AQUI ESTÁ A CORREÇÃO] - Botão Restaurado
            type: 9, 
            accessory: { type: 2, style: 1, label: 'Gerenciar', emoji: { name: '🔘' }, custom_id: 'aut_button_roles_menu', disabled: !isEnabled },
            components: [
                { type: 10, content: "🔘 Cargos Interativos (Button Roles)" },
                { type: 10, content: `Crie mensagens com botões que dão cargos. Criados: \`${counts.button_panels}\`` }
            ]
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 9, 
            accessory: { type: 2, style: 2, label: 'Abrir', emoji: { name: '🏷️' }, custom_id: 'aut_mass_roles_menu', disabled: !isEnabled },
            components: [
                { type: 10, content: "🏷️ Gerenciador de Cargos (Massa)" },
                { type: 10, content: `Adicione ou remova cargos de todos os membros.` }
            ]
        }
    ];

    const currentPageItems = page === 1 ? itemsPage1 : itemsPage2;

    return [{
        type: 17,
        accent_color: 42751,
        components: [
            { type: 10, content: "## ⚙️ Painel de Automatizações", style: 1 },
            { type: 10, content: `**Status Global:** ${isEnabled ? '🟢 Ativado' : '🔴 Desativado'} • Página ${page}/2`, style: 2 },
            { type: 14, divider: true, spacing: 2 },
            
            ...currentPageItems,

            { type: 14, divider: true, spacing: 2 },
            {
                type: 1, 
                components: [
                    { type: 2, style: 2, emoji: { name: '⬅️' }, custom_id: page === 1 ? 'main_menu_back' : 'aut_page_1', disabled: page === 1 && page !== 2 },
                    { type: 2, style: isEnabled ? 4 : 3, label: isEnabled ? 'Desativar Tudo' : 'Ativar Tudo', custom_id: 'automations_toggle_system' },
                    { type: 2, style: 2, emoji: { name: '➡️' }, custom_id: 'aut_page_2', disabled: page === 2 }
                ]
            }
        ]
    }];
}

module.exports = buildAutomationsMenu;