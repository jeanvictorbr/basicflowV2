// Arquivo: handlers/buttons/store_cv_publish_start_.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'store_cv_publish_start_', // Prefixo para detecção dinâmica
    execute: async (interaction) => {
        const categoryId = interaction.customId.split('_').pop();

        // Estrutura V2 completa (sem usar o campo 'content' legado)
        const uiComponents = [
            {
                type: 17, // Container Rico
                components: [
                    // O Texto vira um componente do tipo 10
                    { 
                        type: 10, 
                        content: '📢 **Onde você deseja publicar esta vitrine?**\nSelecione o canal abaixo.' 
                    },
                    // Espaçador
                    { type: 14, divider: true, spacing: 1 },
                    // O Menu de Seleção
                    {
                        type: 1, // Action Row
                        components: [{
                            type: 8, // Channel Select
                            custom_id: `store_cv_sel_channel_${categoryId}`,
                            channel_types: [0], // Apenas canais de texto
                            placeholder: 'Selecione o canal da vitrine'
                        }]
                    }
                ]
            }
        ];

        await interaction.update({
            components: uiComponents,
            flags: EPHEMERAL_FLAG | V2_FLAG
        });
    }
};