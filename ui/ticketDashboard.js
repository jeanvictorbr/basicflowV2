// ui/ticketDashboard.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateTicketDashboard(ticketData = {}, openerMember) {
    const { status = 'open', claimed_by, action_log } = ticketData;

    // Constrói a descrição principal e o log de ações
    let description = `Bem-vindo! Um membro da equipe de suporte estará com você em breve.`;
    if (claimed_by) description = `> Ticket assumido por <@${claimed_by}>.`;

    const embed = new EmbedBuilder()
        .setColor(status === 'closed' ? 'Red' : 'Blue')
        .setTitle('Painel de Gerenciamento do Ticket')
        .setDescription(description)
        .setTimestamp();

    if (openerMember) {
        embed.setThumbnail(openerMember.user.displayAvatarURL());
    }

    // Adiciona o histórico de ações se ele existir
    if (action_log) {
        embed.addFields({ name: 'Histórico de Ações', value: action_log });
    }
    
    // Lógica para os botões do admin
    const isLocked = status === 'locked';
    const isClosed = status === 'closed';

    const components = [];
    if (!isClosed) {
        const mainRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_claim').setLabel(claimed_by ? "Assumido" : "Assumir").setStyle(ButtonStyle.Secondary).setEmoji('🙋‍♂️').setDisabled(!!claimed_by),
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