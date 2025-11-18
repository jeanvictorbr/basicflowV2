// File: handlers/commands/membros.js
// CONTEÚDO COMPLETO E ATUALIZADO

const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = async (interaction) => {
    
    // Verificação de Desenvolvedor
    if (!process.env.DEVELOPER_IDS.includes(interaction.user.id)) {
        return interaction.reply({ 
            content: '❌ Este comando é restrito aos desenvolvedores do bot.', 
            flags: EPHEMERAL_FLAG 
        });
    }

    await interaction.deferReply({ flags: EPHEMERAL_FLAG });

    try {
        // Limpamos o cache do NOVO arquivo
        delete require.cache[require.resolve('../../ui/admin/membrosAdminHub.js')];
        
        // Importamos o NOVO arquivo de UI
        const { getMembrosAdminHub } = require('../../ui/admin/membrosAdminHub.js'); 

        // Chamamos a função correta
        const menu = await getMembrosAdminHub(interaction); 
        
        await interaction.editReply(menu);

    } catch (error) {
        console.error("Erro ao carregar /membros panel:", error);

        // ===================================================================
        //  ⬇️  BLOCO CATCH CORRIGIDO (V2 JSON)  ⬇️
        // ===================================================================
        
        // Criamos um payload de erro V2 padrão
        const errorPayload = {
            type: 17, // V2 Message
            flags: V2_FLAG | EPHEMERAL_FLAG,
            accent_color: 0xED4245, // Red
            components: [
                {
                    "type": 10,
                    "content": "## ❌ Erro ao Carregar Painel"
                },
                {
                    "type": 10,
                    "content": "Ocorreu um erro ao processar seu comando."
                }
            ]
        };
        
        // Adicionamos o detalhe do erro para depuração
        if (error.code === 'MODULE_NOT_FOUND') {
             errorPayload.components.push({
                "type": 10,
                "content": "> **Detalhe:** `ui/admin/membrosAdminHub.js` não foi encontrado."
            });
        } else {
             errorPayload.components.push({
                "type": 10,
                "content": `> **Detalhe:** ${error.message}`
            });
        }
        
        // Enviamos a resposta de erro V2
        await interaction.editReply(errorPayload);
        
        // ===================================================================
        //  ⬆️  FIM DA CORREÇÃO  ⬆️
        // ===================================================================
    }
};