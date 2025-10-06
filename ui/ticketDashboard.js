// ui/ticketDashboard.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateTicketDashboard(ticketData = {}, openerMember) {
    const { status = 'open', claimed_by, action_log } = ticketData;
    
    let description = `Obrigado por contatar o suporte. Por favor, detalhe seu problema.`;
    if (claimed_by) description = `> Ticket assumido por <@${claimed_by}>.`;
    if (status === 'locked') description += `\n\n🔒 **Este ticket está trancado.**`;
    if (status === 'closed') description = `Este ticket foi finalizado.`;

    const embed = new EmbedBuilder()
        .setColor(status === 'closed' ? '#ED4245' : '#3498DB')
        .setTitle('Painel de Gerenciamento do Ticket')
        .setDescription(description)
        .setTimestamp();

    if (openerMember) {
        embed.setAuthor({ name: `Ticket de ${openerMember.user.tag}`, iconURL: openerMember.user.displayAvatarURL() });
        embed.setThumbnail(openerMember.user.displayAvatarURL());
    }

    if (action_log) {
        embed.addFields({ name: 'Histórico de Ações', value: action_log });
    }
    
    const components = [];
    const isClosed = status === 'closed';

    if (!isClosed) {
        const adminRow1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_claim').setLabel(claimed_by ? "Assumido" : "Assumir").setStyle(ButtonStyle.Success).setEmoji('🙋‍♂️').setDisabled(!!claimed_by),
            new ButtonBuilder().setCustomId('ticket_lock').setLabel(status === 'locked' ? "Destrancar" : "Trancar").setStyle(ButtonStyle.Secondary).setEmoji(status === 'locked' ? '🔓' : '🔒'),
            new ButtonBuilder().setCustomId('ticket_alert').setLabel("Alertar").setStyle(ButtonStyle.Primary).setEmoji('🔔')
        );
        const adminRow2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_add_user').setLabel("Adicionar").setStyle(ButtonStyle.Secondary).setEmoji('➕'),
            new ButtonBuilder().setCustomId('ticket_remove_user').setLabel("Remover").setStyle(ButtonStyle.Secondary).setEmoji('➖'),
            new ButtonBuilder().setCustomId('ticket_close').setLabel("Finalizar").setStyle(ButtonStyle.Danger).setEmoji('✔️')
        );
        const userRow = new ActionRowBuilder().addComponents(
             new ButtonBuilder().setCustomId('ticket_user_close').setLabel('Desistir do Ticket').setStyle(ButtonStyle.Danger).setEmoji('✖️').setDisabled(!!claimed_by)
         );
        components.push(adminRow1, adminRow2, userRow);
    } else {
        const deleteRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_delete').setLabel("Deletar Ticket").setStyle(ButtonStyle.Danger).setEmoji('🗑️')
        );
        components.push(deleteRow);
    }

    return { embeds: [embed], components };
};