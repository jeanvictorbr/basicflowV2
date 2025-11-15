const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

function getImportMenu(blueprints) {
    
    const options = blueprints.map(bp => ({
        label: bp.template_name,
        description: `Criado em: ${new Date(bp.created_at).toLocaleDateString('pt-BR')}`,
        value: bp.blueprint_id.toString()
    }));

    if (options.length > 25) {
        options.length = 25; // Limite do Select Menu
    }

    /**
     * CORREÇÃO: Removido o 'data: {}' que encapsulava a resposta.
     * Agora o handler 'blueprint-importar.js' vai receber
     * as chaves 'content' e 'components' diretamente.
     */
    return {
        content: 'Selecione o blueprint que você deseja importar para **este servidor**.\n⚠️ **Atenção:** A importação irá **substituir todos os cargos e canais** deste servidor.',
        components: [
            {
                type: 1, // Action Row
                components: [
                    {
                        type: 3, // String Select
                        custom_id: 'architect_select_import',
                        placeholder: 'Escolha um blueprint...',
                        options: options
                    }
                ]
            }
        ]
    };
}

module.exports = { getImportMenu };