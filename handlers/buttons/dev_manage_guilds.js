const devPanelUtils = require('../../utils/devPanelUtils.js');
// Importação segura com fallback
const getAndPrepareGuildData = devPanelUtils.getAndPrepareGuildData;

const generateDevGuildsMenu = require('../../ui/devPanel/devGuildsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_manage_guilds',
    async execute(interaction) {
        // DEBUG: Verificar se a função foi importada corretamente
        console.log('Debug dev_manage_guilds:', typeof getAndPrepareGuildData);
        
        if (typeof getAndPrepareGuildData !== 'function') {
            console.error('ERRO CRÍTICO: getAndPrepareGuildData não é uma função!', devPanelUtils);
            // Resposta de erro compatível com V2
            return interaction.reply({ 
                components: [{
                    type: 17,
                    components: [{ type: 10, content: '❌ **Erro Interno:** Função de utilitário não encontrada.' }]
                }],
                flags: V2_FLAG | EPHEMERAL_FLAG 
            });
        }

        // Se já foi deferido antes, usamos editReply, senão deferUpdate ou reply
        if (!interaction.deferred && !interaction.replied) {
             await interaction.deferUpdate();
        }
        
        try {
            const { allGuildData, totals } = await getAndPrepareGuildData(interaction.client);
            
            await interaction.editReply({
                components: generateDevGuildsMenu(allGuildData, 0, totals, 'default'),
                flags: V2_FLAG | EPHEMERAL_FLAG,
            });
        } catch (error) {
            console.error('Erro em dev_manage_guilds:', error);
            
            // --- CORREÇÃO DO ERRO 50035 ---
            // Não podemos usar 'content' puro com flags V2. Temos que usar estrutura de componentes.
            await interaction.editReply({
                components: [{
                    type: 17,
                    components: [
                        { 
                            type: 10, 
                            content: `❌ **Ocorreu um erro ao processar os dados das guildas.**\nLogs: \`${error.message}\`` 
                        }
                    ]
                }],
                flags: V2_FLAG | EPHEMERAL_FLAG
            });
        }
    }
};