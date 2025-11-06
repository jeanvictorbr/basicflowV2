const { EmbedBuilder, ButtonStyle } = require('discord.js');

/**
 * Retorna a estrutura de Embed e Componentes para a pré-visualização do anúncio.
 * @param {string} channelId ID do canal de destino.
 * @param {object} modalData Dados extraídos do modal (title, content, image, thumbnail, footerText).
 * @param {string} clientMainColor Cor principal do bot.
 * @returns {{embeds: object[], components: object[], modalData: object}} Objeto contendo Embed, Componentes V2 e os dados do modal.
 */
function getAnnouncementPreview(channelId, modalData, clientMainColor) {
    const { title, content, image, thumbnail, footerText } = modalData;

    const embed = new EmbedBuilder()
        .setColor(clientMainColor || '#0099ff') 
        .setDescription(content)
        .setTimestamp();
    
    // Aplica o Título
    if (title && title.length > 0) {
        embed.setTitle(title);
    }
    
    // Aplica a Imagem de corpo
    if (image && image.length > 0) {
        embed.setImage(image);
    }

    // Aplica o Thumbnail
    if (thumbnail && thumbnail.length > 0) {
        embed.setThumbnail(thumbnail);
    }
    
    // Aplica o Rodapé
    if (footerText && footerText.length > 0) {
        embed.setFooter({ text: footerText });
    }

    // Passa o ID do canal para os próximos handlers no customId
    const sendCustomId = `anuncio_send_${channelId}`;
    const cancelCustomId = `anuncio_cancel_${channelId}`;
    const editCustomId = `anuncio_edit_${channelId}`; // NOVO ID

    // Estrutura de Componentes V2 (Regra OBRIGATÓRIA: não usar Builders aqui)
    return {
        embeds: [embed.toJSON()],
        components: [
            {
                type: 1, // ActionRow
                components: [
                    {
                        type: 2, // Button
                        custom_id: sendCustomId,
                        style: ButtonStyle.Success, // Verde
                        label: '✅ Publicar Anúncio Agora',
                    },
                    {
                        type: 2, // Button
                        custom_id: editCustomId, // NOVO BOTÃO
                        style: ButtonStyle.Primary, // Azul/Primário
                        label: '✏️ Editar Conteúdo',
                    },
                    {
                        type: 2, // Button
                        custom_id: cancelCustomId,
                        style: ButtonStyle.Danger, // Vermelho
                        label: '❌ Cancelar Envio',
                    },
                ],
            },
        ],
        // Retorna os dados do modal para serem usados no botão de edição
        modalData: modalData,
    };
}

module.exports = {
    getAnnouncementPreview,
};