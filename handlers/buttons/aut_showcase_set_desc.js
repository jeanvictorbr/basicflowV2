// File: handlers/buttons/aut_showcase_set_desc.js
module.exports = {
    customId: 'aut_showcase_set_desc',
    async execute(interaction) {
        const modal = {
            type: 9, 
            custom_id: 'modal_aut_showcase_set_desc',
            title: 'Definir Descrição da Vitrine',
            components: [{
                type: 1, components: [{
                    type: 4, custom_id: 'description', label: 'Descrição (Use > para citação)',
                    style: 2, required: true, 
                    placeholder: '> Para ter acesso completo aos canais...',
                    value: '> Para ter acesso completo aos canais deste servidor e confirmar sua identidade, clique no botão abaixo e autorize o BasicFlow.'
                }]
            }]
        };
        await interaction.showModal(modal);
    }
};