/**
 * Retorna o objeto de definição de um Modal para anúncio, contendo campos de texto.
 * @param {string} customId O customId completo que será anexado ao Modal.
 * @returns {object} O objeto Modal bruto (componentes de input).
 */
function getAnnouncementModal(customId) {
    return {
        custom_id: customId,
        title: 'Criar Novo Anúncio',
        components: [
            {
                type: 1, // ActionRow (Título)
                components: [
                    {
                        type: 4, // TextInput
                        custom_id: 'announcement_title',
                        label: 'Título do Anúncio (Opcional)',
                        style: 1, // Short
                        required: false,
                        max_length: 256,
                        placeholder: 'Deixe em branco para não ter título.',
                    },
                ],
            },
            {
                type: 1, // ActionRow (Conteúdo)
                components: [
                    {
                        type: 4, // TextInput
                        custom_id: 'announcement_content',
                        label: 'Conteúdo do Anúncio',
                        style: 2, // Paragraph
                        required: true,
                        min_length: 5,
                        max_length: 4000,
                        placeholder: 'Digite o corpo da mensagem aqui. Use \n para quebra de linha.',
                    },
                ],
            },
            {
                type: 1, // ActionRow (Imagem)
                components: [
                    {
                        type: 4, // TextInput
                        custom_id: 'announcement_image_url',
                        label: 'URL da Imagem (Embed/Corpo)',
                        style: 1, // Short
                        required: false,
                        max_length: 2048, // Adicionado limite
                        placeholder: 'https://seusite.com/imagem.png',
                    },
                ],
            },
            {
                type: 1, // ActionRow (Thumbnail)
                components: [
                    {
                        type: 4, // TextInput
                        custom_id: 'announcement_thumbnail_url',
                        label: 'URL do Thumbnail (Miniatura Lateral)',
                        style: 1, // Short
                        required: false,
                        max_length: 2048, // Adicionado limite
                        placeholder: 'https://seusite.com/thumbnail.png',
                    },
                ],
            },
            {
                type: 1, // ActionRow (Rodapé)
                components: [
                    {
                        type: 4, // TextInput
                        custom_id: 'announcement_footer_text',
                        label: 'Texto do Rodapé',
                        style: 1, // Short
                        required: false,
                        max_length: 2048, // Adicionado limite
                        placeholder: 'Rodapé - opcional.',
                    },
                ],
            },
        ],
    };
}

module.exports = {
    getAnnouncementModal,
};