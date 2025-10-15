// Substitua o conteúdo em: ui/tickets/dmStaffControlEmbed.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateDmStaffControlEmbed(ticket, user) {
    const embed = new EmbedBuilder()
        .setColor('#E67E22')
        .setTitle('⚙️ Painel de Controle do Atendimento')
        .setDescription(
            `Atendimento via DM para **${user.tag}** (\`${user.id}\`).\n` +
            `Este ticket foi aberto em: <t:${Math.floor(new Date(ticket.created_at).getTime() / 1000)}:f>`
        )
        .addFields(
            { name: 'Status', value: ticket.claimed_by ? `Em atendimento por <@${ticket.claimed_by}>` : 'Aguardando atendente', inline: true },
        );

    // CORREÇÃO: O botão de fechar agora chama o handler universal 'ticket_close'
    const closeButton = new ButtonBuilder()
        .setCustomId('ticket_close') // <- MUDANÇA IMPORTANTE AQUI
        .setLabel('Finalizar Atendimento')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔒');

    const addUserButton = new ButtonBuilder()
        .setCustomId(`ticket_dm_add_user_${ticket.channel_id}`)
        .setLabel('Adicionar Membro')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('➕');
        
    const removeUserButton = new ButtonBuilder()
        .setCustomId(`ticket_dm_remove_user_${ticket.channel_id}`)
        .setLabel('Remover Membro')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('➖');

    const row = new ActionRowBuilder().addComponents(closeButton, addUserButton, removeUserButton);

    return { embeds: [embed], components: [row] };
};