// File: handlers/buttons/aut_reg_back_to_registros.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    customId: 'aut_reg_back_to_registros',
    async execute(interaction) {
        
        // Reutiliza a lógica do handler que abre o menu principal de registros
        const openRegistrosHandler = interaction.client.buttons.get('open_registros_menu');
        
        if (openRegistrosHandler) {
            await openRegistrosHandler.execute(interaction);
        } else {
            console.error("Handler 'open_registros_menu' não encontrado.");
            await interaction.reply({ 
                content: '❌ Ocorreu um erro ao tentar voltar.', 
                flags: EPHEMERAL_FLAG 
            });
        }
    }
};