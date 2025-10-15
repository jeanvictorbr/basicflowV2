// Crie este arquivo
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateDmWelcomeEmbed(interaction, ticket) {
    const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('✅ Sessão de Suporte Iniciada')
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
        .setThumbnail('https://media.discordapp.net/attachments/1310610658844475404/1426758912224264344/Logotipo_Banda_de_Rock_Vermelho_e_Preto__1_-removebg-preview.png?ex=68ee5e88&is=68ed0d08&hm=0ea8b2cd632e2c5e581a723905b1da970a8176111356b2e72564d843418ba30a&=&format=webp&quality=lossless') // Coloque o link da sua logo aqui
        .setDescription(`Olá **${interaction.user.username}**! Seu canal de suporte privado foi criado.\n\nPode começar a descrever seu problema. Você pode enviar mensagens, imagens, vídeos e links que nossa equipe receberá.`)
        .addFields({ name: 'O que acontece agora?', value: '1. Descreva seu problema com o máximo de detalhes.\n2. Um atendente irá assumir seu caso e responderá aqui.\n3. Você conversará com o atendente diretamente por aqui.' })
        .setFooter({ text: `ID do Atendimento: ${ticket.channel_id}` });

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`ticket_dm_close_request_${ticket.channel_id}`)
            .setLabel('Finalizar Atendimento')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('✖️')
    );

    return { embeds: [embed], components: [buttons] };
};