// File: handlers/buttons/aut_showcase_set_image.js
module.exports = {
    customId: 'aut_showcase_set_image',
    async execute(interaction) {
        const modal = {
            type: 9, 
            custom_id: 'modal_aut_showcase_set_image',
            title: 'Definir Imagem da Vitrine',
            components: [{
                type: 1, components: [{
                    type: 4, custom_id: 'image', label: 'URL da Imagem (https://...)',
                    style: 1, required: false, 
                    placeholder: 'Deixe em branco para remover a imagem'
                }]
            }]
        };
        await interaction.showModal(modal);
    }
};