// ui/ticketDashboard.js
module.exports = function generateTicketDashboard(ticketData = {}) {
    const { status = 'open', claimed_by } = ticketData;

    // Lógica para determinar quais botões mostrar
    const isClaimed = !!claimed_by;
    const isLocked = status === 'locked';
    const isClosed = status === 'closed';

    const mainButtons = [
        { "type": 2, "style": 2, "label": isClaimed ? "Assumido" : "Assumir", "emoji": { "name": "🙋‍♂️" }, "custom_id": "ticket_claim", "disabled": isClaimed },
        { "type": 2, "style": 1, "label": "Adicionar", "emoji": { "name": "➕" }, "custom_id": "ticket_add_user" },
        { "type": 2, "style": 1, "label": "Remover", "emoji": { "name": "➖" }, "custom_id": "ticket_remove_user" },
        { "type": 2, "style": 2, "label": isLocked ? "Destrancar" : "Trancar", "emoji": { "name": isLocked ? "🔓" : "🔒" }, "custom_id": "ticket_lock" }
    ];

    const dangerButtons = [
        { "type": 2, "style": 4, "label": "Finalizar", "emoji": { "name": "✔️" }, "custom_id": "ticket_close" },
        { "type": 2, "style": 2, "label": "Alertar", "emoji": { "name": "🔔" }, "custom_id": "ticket_alert" }
    ];
    
    // Botão que só aparece quando o ticket está finalizado
    const deleteButton = { "type": 2, "style": 4, "label": "Deletar Ticket", "emoji": { "name": "🗑️" }, "custom_id": "ticket_delete" };
    
    // Monta o dashboard
    const components = [
        { "type": 1, "components": isClosed ? [deleteButton] : mainButtons },
    ];
    if (!isClosed) {
        components.push({ "type": 1, "components": dangerButtons });
    }

    // Define o conteúdo da mensagem
    let content = `**Ticket de Suporte**\nBem-vindo! Um membro da equipe de suporte estará com você em breve.`;
    if (isClaimed) content = `> Ticket assumido por <@${claimed_by}>.`;
    if (isLocked) content += `\n\n🔒 **Este ticket está trancado.** Apenas a equipe pode enviar mensagens.`;
    if (isClosed) content = `Este ticket foi finalizado.`;

    return [
        {
            "type": 17,
            "components": [
                { "type": 10, "content": content },
                { "type": 14, "divider": true, "spacing": 1 }
            ].concat(components) // Adiciona os botões dinamicamente
        }
    ];
};