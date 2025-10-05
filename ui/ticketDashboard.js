// ui/ticketDashboard.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateTicketDashboard(ticketData = {}) {
    const { status = 'open', claimed_by } = ticketData;

    // Define o conteúdo do embed
    let description = `Bem-vindo! Um membro da equipe de suporte estará com você em breve.`;
    if (claimed_by) description = `> Ticket assumido por <@${claimed_by}>.`;
    if (status === 'locked') description += `\n\n🔒 **Este ticket está trancado.**`;
    if (status === 'closed') description = `Este ticket foi finalizado por <@${claimed_by}>.`;

    const embed = new EmbedBuilder()
        .setColor(status === 'closed' ? 'Red' : 'Blue')
        .setTitle('Ticket de Suporte')
        .setDescription(description)
        .setTimestamp();

    // Lógica para determinar quais botões mostrar
    const isClaimed = !!claimed_by;
    const isLocked = status === 'locked';
    const isClosed = status === 'closed';

    const components = [];

    if (!isClosed) {
        const mainRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_claim').setLabel(isClaimed ? "Assumido" : "Assumir").setStyle(ButtonStyle.Secondary).setEmoji('🙋‍♂️').setDisabled(isClaimed),
            new ButtonBuilder().setCustomId('ticket_add_user').setLabel("Adicionar").setStyle(ButtonStyle.Primary).setEmoji('➕'),
            new ButtonBuilder().setCustomId('ticket_remove_user').setLabel("Remover").setStyle(ButtonStyle.Primary).setEmoji('➖'),
            new ButtonBuilder().setCustomId('ticket_lock').setLabel(isLocked ? "Destrancar" : "Trancar").setStyle(ButtonStyle.Secondary).setEmoji(isLocked ? '🔓' : '🔒')
        );
        const dangerRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_close').setLabel("Finalizar").setStyle(ButtonStyle.Danger).setEmoji('✔️'),
            new ButtonBuilder().setCustomId('ticket_alert').setLabel("Alertar").setStyle(ButtonStyle.Secondary).setEmoji('🔔')
        );
        components.push(mainRow, dangerRow);
    } else {
        const deleteRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_delete').setLabel("Deletar Ticket").setStyle(ButtonStyle.Danger).setEmoji('🗑️')
        );
        components.push(deleteRow);
    }

    return { embeds: [embed], components };
};