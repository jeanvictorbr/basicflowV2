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
            console.error('ERRO CRÍTICO: getAndPrepareGuildData não é uma função! Conteúdo do utils:', devPanelUtils);
            return interaction.reply({ 
                content: '❌ Erro interno: Função de utilitário não encontrada. Verifique os logs.', 
                flags: EPHEMERAL_FLAG 
            });
        }

        await interaction.deferUpdate();
        
        try {
            const { allGuildData, totals } = await getAndPrepareGuildData(interaction.client);
            
            await interaction.editReply({
                components: generateDevGuildsMenu(allGuildData, 0, totals, 'default'),
                flags: V2_FLAG | EPHEMERAL_FLAG,
            });
        } catch (error) {
            console.error('Erro em dev_manage_guilds:', error);
            await interaction.editReply({
                content: '❌ Ocorreu um erro ao processar os dados das guildas.'
            });
        }
    }
};