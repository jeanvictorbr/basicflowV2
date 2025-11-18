// File: handlers/buttons/membros_user_ban_.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    /**
     * 1. customId dinâmico para o botão de banir.
     */
    customId: 'membros_user_ban_',

    /**
     * 2. Função execute que abre o modal para coletar o motivo.
     */
    async execute(interaction) {
        
        try {
            const [, , , userId, scope] = interaction.customId.split('_');

            // 3. Exibe o modal para coletar o motivo (padrão V2 JSON)
            // Este modal será tratado pelo handler: handlers/modals/modal_membros_ban_reason_.js
            await interaction.showModal({
                type: 9, // Modal Type
                custom_id: `modal_membros_ban_reason_${userId}_${scope}`,
                title: 'Banir Membro',
                components: [
                    {
                        type: 1, // Action Row
                        components: [
                            {
                                type: 4, // Text Input
                                custom_id: 'reason',
                                label: 'Motivo do Banimento',
                                style: 2, // Paragraph
                                min_length: 5,
                                max_length: 500,
                                placeholder: 'Informe o motivo pelo qual este membro está sendo banido...',
                                required: true
                            }
                        ]
                    }
                ]
            });

        } catch (error) {
            console.error('Erro ao exibir modal de banimento:', error);
            
            // Se o deferUpdate não foi usado (como neste caso), usamos reply
            await interaction.reply({
                type: 17, 
                flags: V2_FLAG | EPHEMERAL_FLAG,
                accent_color: 0xED4245, // Vermelho
                components: [
                    { "type": 10, "content": "❌ Ocorreu um erro ao tentar abrir o modal de banimento." }
                ]
            });
        }
    }
};