// File: handlers/buttons/aut_showcase_set_footer.js
module.exports = {
    customId: 'aut_showcase_set_footer',
    async execute(interaction) {
        const modal = {
            type: 9, 
            custom_id: 'modal_aut_showcase_set_footer',
            title: 'Definir Rodapé da Vitrine',
            components: [{
                type: 1, components: [{
                    type: 4, custom_id: 'footer', label: 'Rodapé (Use > para citação)',
                    style: 1, required: true, 
                    placeholder: '> Sua verificação é segura...',
                    value: '> Sua verificação é segura e seus dados estão protegidos.'
                }]
            }]
        };
        await interaction.showModal(modal);
    }
};