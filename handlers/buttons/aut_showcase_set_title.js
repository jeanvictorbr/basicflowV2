// File: handlers/buttons/aut_showcase_set_title.js
module.exports = {
    customId: 'aut_showcase_set_title',
    async execute(interaction) {
        const modal = {
            type: 9, 
            custom_id: 'modal_aut_showcase_set_title',
            title: 'Definir Título da Vitrine',
            components: [{
                type: 1, components: [{
                    type: 4, custom_id: 'title', label: 'Título (Use ## para Título Grande)',
                    style: 1, required: true, 
                    placeholder: '## 🛡️ Verificação CloudFlow',
                    value: '## 🛡️ Verificação CloudFlow'
                }]
            }]
        };
        await interaction.showModal(modal);
    }
};