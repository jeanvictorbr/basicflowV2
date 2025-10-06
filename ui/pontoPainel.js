// ui/pontoPainel.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generatePontoPainel(settings) {
    const embed = new EmbedBuilder()
        .setColor('#11806A') // Verde escuro
        .setTitle('Sistema de Bate-Ponto')
        .setDescription('Utilize os botões abaixo para registrar o início e o fim do seu serviço.')
        .setImage(settings.ponto_imagem_vitrine);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ponto_start_service').setLabel('Entrar em Serviço').setStyle(ButtonStyle.Success).setEmoji('▶️'),
        new ButtonBuilder().setCustomId('ponto_end_service').setLabel('Sair de Serviço').setStyle(ButtonStyle.Danger).setEmoji('⏹️')
    );

    return { embeds: [embed], components: [row] };
};