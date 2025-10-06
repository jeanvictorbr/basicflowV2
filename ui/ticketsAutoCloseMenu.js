// ui/ticketsAutoCloseMenu.js
module.exports = function generateAutoCloseMenu(settings) {
    const systemStatus = settings.tickets_autoclose_enabled ? '✅ Ativado' : '❌ Desativado';
    const toggleSystemButton = settings.tickets_autoclose_enabled 
        ? { label: 'Desativar Sistema', style: 4, emoji: '✖️' } 
        : { label: 'Ativar Sistema', style: 3, emoji: '✔️' };

    // Lógica para o novo botão de aviso
    const warnStatus = settings.tickets_autoclose_warn_user !== false ? '✅ Ativado' : '❌ Desativado'; // Ativo por padrão
    const toggleWarnButton = settings.tickets_autoclose_warn_user !== false
        ? { label: 'Desativar Aviso', style: 4 }
        : { label: 'Ativar Aviso', style: 3 };

    const dmStatus = settings.tickets_autoclose_dm_user ? '✅ Ativado' : '❌ Desativado';
    const toggleDmButton = settings.tickets_autoclose_dm_user
        ? { label: 'Desativar Notificação', style: 4 }
        : { label: 'Ativar Notificação', style: 3 };

    const inactivityHours = settings.tickets_autoclose_hours || 48;

    return [
        {
            "type": 17, "accent_color": 5752042,
            "components": [
                { "type": 10, "content": "## ⏳ Gerenciador de Auto-Fechamento" },
                { "type": 10, "content": "> Tickets sem nenhuma mensagem por um período de tempo serão fechados automaticamente." },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": toggleSystemButton.style, "label": toggleSystemButton.label, "emoji": { "name": toggleSystemButton.emoji }, "custom_id": "tickets_autoclose_toggle_system" },
                    "components": [{ "type": 10, "content": `**Sistema de Auto-Fechamento**\n> Status: \`${systemStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 1, "label": "Definir Tempo", "emoji": { "name": "⏱️" }, "custom_id": "tickets_autoclose_set_hours" },
                    "components": [{ "type": 10, "content": `**Tempo de Inatividade**\n> Fechar tickets inativos há mais de \`${inactivityHours}\` horas.` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": toggleWarnButton.style, "label": toggleWarnButton.label, "custom_id": "tickets_autoclose_toggle_warn" },
                    "components": [{ "type": 10, "content": `**Aviso Prévio no Ticket**\n> Status: \`${warnStatus}\` (Avisa 15 min antes)` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": toggleDmButton.style, "label": toggleDmButton.label, "custom_id": "tickets_autoclose_toggle_dm" },
                    "components": [{ "type": 10, "content": `**Notificar Usuário por DM**\n> Status: \`${dmStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1,
                    "components": [{ "type": 2, "style": 2, "label": "Voltar ao Hub Premium", "emoji": { "name": "↩️" }, "custom_id": "tickets_open_premium_menu" }]
                }
            ]
        }
    ];
};