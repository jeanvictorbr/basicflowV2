// ui/registroVitrineEmbed.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateRegistroVitrine(settings) {
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('# Sistema de Registro')
        .setDescription('Seja bem-vindo(a)! Para iniciar seu registro em nosso servidor, por favor, clique no botão abaixo.')
        .setImage(settings.registros_imagem_vitrine); // ATUALIZADO para usar a imagem configurada

    const button = new ButtonBuilder()
        .setCustomId('registros_iniciar_registro')
        .setLabel('Iniciar Registro')
        .setStyle(ButtonStyle.Success)
        .setEmoji('📝');

    const row = new ActionRowBuilder().addComponents(button);

    return { embeds: [embed], components: [row] };
};