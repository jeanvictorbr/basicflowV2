// handlers/buttons/aut_ann_delete_.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_ann_delete_',
    async execute(interaction) {
        // Extrai o ID (ex: aut_ann_delete_15 -> 15)
        const annId = interaction.customId.split('_').pop();

        if (!annId) {
            return interaction.reply({ content: "❌ ID do anúncio não encontrado.", flags: EPHEMERAL_FLAG });
        }

        const confirmLayout = {
            type: 17,
            accent_color: 15548997, // Vermelho
            components: [
                { 
                    type: 10, 
                    content: "## 🗑️ Confirmar Exclusão" 
                },
                { 
                    type: 10, 
                    content: `Tem certeza que deseja apagar o anúncio **ID: ${annId}**?\nIsso cancelará os agendamentos imediatamente.` 
                },
                { type: 14, divider: true, spacing: 2 },
                {
                    type: 1,
                    components: [
                        {
                            type: 2, 
                            style: 4, // Vermelho
                            label: 'Confirmar Exclusão',
                            emoji: { name: '🗑️' },
                            // MUDANÇA CRÍTICA AQUI: ID único para não conflitar com o anterior
                            custom_id: `aut_ann_cfm_del_${annId}` 
                        },
                        {
                            type: 2, 
                            style: 2, // Cinza
                            label: 'Cancelar',
                            custom_id: `aut_ann_back_to_manage_${annId}` 
                        }
                    ]
                }
            ]
        };

        // Usa update para substituir o menu atual
        await interaction.update({
            components: [confirmLayout],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};