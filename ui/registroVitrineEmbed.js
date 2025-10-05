// ui/registroVitrineEmbed.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateRegistroVitrine() {
    const embed = new EmbedBuilder()
        .setColor('#0099ff') // Azul
        .setTitle('# Sistema de Registro')
        .setDescription('Seja bem-vindo(a)! Para iniciar seu registro em nosso servidor, por favor, clique no botão abaixo.')
        .setThumbnail('https://i.imgur.com/your_server_logo.png'); // Considere adicionar um logo aqui

    const button = new ButtonBuilder()
        .setCustomId('registros_iniciar_registro')
        .setLabel('Iniciar Registro')
        .setStyle(ButtonStyle.Success)
        .setEmoji('📝');

    const row = new ActionRowBuilder().addComponents(button);

    return { embeds: [embed], components: [row] };
};