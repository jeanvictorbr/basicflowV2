// Caminho: ui/activateKeyModal.js

/**
 * Gera o JSON V2 para o modal de ativação de chave.
 */
module.exports = () => {
    return {
        title: 'Ativação de Chave Premium',
        custom_id: 'modal_ativar_key',
        components: [
            {
                type: 1, // Action Row
                components: [
                    {
                        type: 4, // Text Input
                        custom_id: 'key_input', // Este é o ID correto que o handler espera
                        label: 'Insira sua chave premium',
                        style: 1, // Short
                        min_length: 1,
                        required: true,
                        placeholder: 'XXXX-XXXX-XXXX-XXXX'
                    }
                ]
            }
        ]
    };
};