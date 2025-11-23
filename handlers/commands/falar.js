const { EmbedBuilder } = require('discord.js');
const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = async function(interaction) {
    const message = interaction.options.getString('mensagem');
    const useEmbed = interaction.options.getBoolean('embed') || false;

    // Confirmação visual para o admin (ninguém mais vê)
    await interaction.deferReply({ flags: EPHEMERAL_FLAG });

    try {
        if (useEmbed) {
            const embed = new EmbedBuilder()
                .setDescription(message)
                .setColor(interaction.guild.members.me.displayHexColor || '#0099ff'); // Cor do bot
            
            await interaction.channel.send({ embeds: [embed] });
        } else {
            await interaction.channel.send(message);
        }

        await interaction.editReply({ content: '✅ Mensagem enviada com sucesso!' });
    } catch (error) {
        console.error('[Comando Falar] Erro:', error);
        await interaction.editReply({ content: '❌ Não consegui enviar a mensagem. Verifique minhas permissões.' });
    }
};