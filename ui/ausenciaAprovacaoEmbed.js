// Crie em: ui/ausenciaAprovacaoEmbed.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateAusenciaAprovacao(member, startDate, endDate, reason) {
    const embed = new EmbedBuilder()
        .setColor('#FFA500') // Laranja (Pendente)
        .setTitle('Nova Solicitação de Ausência')
        .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
        .addFields(
            { name: '👤 Membro', value: `${member}`, inline: true },
            { name: '📅 Início', value: `\`${startDate}\``, inline: true },
            { name: '📅 Término', value: `\`${endDate}\``, inline: true },
            { name: '📝 Motivo', value: reason }
        )
        .setTimestamp();

    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('ausencia_aprovar').setLabel('Aprovar').setStyle(ButtonStyle.Success).setEmoji('✅'),
            new ButtonBuilder().setCustomId('ausencia_recusar').setLabel('Recusar').setStyle(ButtonStyle.Danger).setEmoji('❌')
        );

    return { embeds: [embed], components: [buttons] };
};