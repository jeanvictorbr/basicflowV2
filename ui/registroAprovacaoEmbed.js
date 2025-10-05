// ui/registroAprovacaoEmbed.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateAprovacao(member, nomeRp, idRp) {
    const embed = new EmbedBuilder()
        .setColor('#FFA500') // Laranja (Pendente)
        .setTitle('Nova Ficha de Registro')
        .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
        .addFields(
            { name: '👤 Usuário', value: `${member}`, inline: true },
            { name: '🆔 ID Discord', value: `\`${member.id}\``, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: '📝 Nome RP', value: `\`${nomeRp}\``, inline: true },
            { name: '🔢 ID RP', value: `\`${idRp}\``, inline: true }
        )
        .setTimestamp();

    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('registros_aprovar').setLabel('Aprovar').setStyle(ButtonStyle.Success).setEmoji('✅'),
            new ButtonBuilder().setCustomId('registros_recusar').setLabel('Recusar').setStyle(ButtonStyle.Danger).setEmoji('❌')
        );

    return { embeds: [embed], components: [buttons] };
};