// ui/pontoPainel.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
module.exports = function generatePontoPainel(settings) {
    const embed = new EmbedBuilder()
        .setColor('#11806A')
        .setTitle('Sistema de Bate-Ponto')
        .setDescription('Utilize os botões abaixo para registrar o início e o fim do seu serviço.')
        .setImage(settings.ponto_imagem_vitrine);

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ponto_start_service').setLabel('Entrar em Serviço').setStyle(ButtonStyle.Success).setEmoji('▶️'),
        new ButtonBuilder().setCustomId('ponto_end_service').setLabel('Sair de Serviço').setStyle(ButtonStyle.Danger).setEmoji('⏹️')
    );
    const row2 = new ActionRowBuilder().addComponents( // NOVA LINHA DE BOTÃO
        new ButtonBuilder().setCustomId('ponto_show_ranking').setLabel('Ranking Ponto').setStyle(ButtonStyle.Primary).setEmoji('🏆')
    );

    return { embeds: [embed], components: [row1, row2] };
};