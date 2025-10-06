// ui/registroVitrineEmbed.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateRegistroVitrine(settings) {
    const defaultImage = 'https://media.discordapp.net/attachments/1310610658844475404/1424391049648017571/E99EBFA9-97D6-42F2-922C-6AC4EEC1651A.png?ex=68e46fca&is=68e31e4a&hm=167f4d74e96a1250138270ac9396faec3eb7ed427afb3490510b4f969b4f1a1f&=&format=webp&quality=lossless';

    const embed = new EmbedBuilder()
        .setColor('#0099ff') // Azul
        .setTitle('Sistema de Registro')
        .setDescription('Seja bem-vindo(a)! Para iniciar seu registro em nosso servidor, por favor, clique no botão abaixo.')
        .setImage(settings.registros_imagem_vitrine || defaultImage); // LÓGICA DA IMAGEM PADRÃO

    const button = new ButtonBuilder()
        .setCustomId('registros_iniciar_registro')
        .setLabel('Iniciar Registro')
        .setStyle(ButtonStyle.Success)
        .setEmoji('📝');

    const row = new ActionRowBuilder().addComponents(button);

    return { embeds: [embed], components: [row] };
};