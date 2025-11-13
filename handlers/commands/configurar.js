// Conteúdo completo para: handlers/commands/configurar.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
const mainMenu = require('../../ui/mainMenu.js'); 
const { PermissionsBitField } = require('discord.js');

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function execute(interaction) {
    // 1. Adia a resposta para garantir que temos tempo
    await interaction.deferReply({ flags: EPHEMERAL_FLAG });

    // 2. Verificar permissões
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.editReply({
            content: '❌ Você precisa de permissão de Administrador para usar este comando.'
        });
    }

    try {
        // 3. Gerar o menu
        // O mainMenu (ui/mainMenu.js) retorna um ARRAY de componentes V2
        const menuComponents = await mainMenu(interaction, 0); 

        // 4. Responder com editReply
        await interaction.editReply({
            // ===================================================================
            //  ⬇️  A CORREÇÃO ESTÁ AQUI  ⬇️
            // ===================================================================

            // ANTES (ERRADO):
            // ...menuComponents, 
            
            // DEPOIS (CORRETO):
            // O array retornado pelo UI deve ser atribuído à chave 'components'
            components: menuComponents,

            // ===================================================================
            //  ⬆️  FIM DA CORREÇÃO ⬆️
            // ===================================================================
            
            flags: V2_FLAG | EPHEMERAL_FLAG
        });

    } catch (error) {
        console.error('Erro ao executar /configurar:', error);
        await interaction.editReply({
            content: '❌ Ocorreu um erro ao buscar as configurações do servidor.'
        });
    }
}

// Exporta o execute para o index.js
module.exports = {
    execute,
};