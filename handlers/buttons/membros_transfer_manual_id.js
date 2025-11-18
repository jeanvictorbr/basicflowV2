// handlers/buttons/membros_transfer_manual_id.js
// CONTEÚDO COMPLETO E ATUALIZADO
module.exports = {
    customId: 'membros_transfer_manual_id',
    async execute(interaction) {
        
        // ===================================================================
        //  ⬇️  CORREÇÃO DO MODAL ⬇️
        // ===================================================================
        // Alterado o segundo campo de 'transfer_reason' para 'quantity'
        
        const modal = {
            type: 9, // MODAL_SUBMIT
            custom_id: `modal_membros_transfer_manual_id`,
            title: 'Transferência Global (Manual)',
            components: [
                {
                    type: 1, // Action Row
                    components: [
                        {
                            type: 4, // Text Input
                            custom_id: 'target_guild_id',
                            label: 'ID da Guilda de Destino',
                            style: 1, // Short
                            placeholder: 'Cole o ID do servidor para onde transferir',
                            required: true,
                        },
                    ],
                },
                {
                    type: 1, // Action Row
                    components: [
                        {
                            type: 4, // Text Input
                            custom_id: 'quantity', // <-- CORRIGIDO
                            label: 'Quantidade', // <-- CORRIGIDO
                            style: 1, // Short
                            placeholder: 'Digite um número (ex: 500) ou "ALL" para todos', // <-- CORRIGIDO
                            required: true,
                        },
                    ],
                },
            ],
        };
        // ===================================================================
        //  ⬆️  FIM DA CORREÇÃO ⬆️
        // ===================================================================

        await interaction.showModal(modal);
    }
};