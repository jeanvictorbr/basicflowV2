// handlers/buttons/dev_manage_guilds.js
const devPanelUtils = require('../../utils/devPanelUtils.js');
// Importação segura com fallback
const getAndPrepareGuildData = devPanelUtils.getAndPrepareGuildData;

const generateDevGuildsMenu = require('../../ui/devPanel/devGuildsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;
const STORE_GUILD_ID = '1424757317701996544'; // ID do Servidor da Loja

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
            
            // --- NOVA LÓGICA: Verificar Donos na Loja (Página 0) ---
            const ownersInStore = new Set();
            try {
                // Como esta é a página inicial (0) e a UI mostra 4 itens:
                const currentSlice = allGuildData.slice(0, 4); 
                const storeGuild = interaction.client.guilds.cache.get(STORE_GUILD_ID);
                
                if (storeGuild) {
                    const ownerIdsToCheck = currentSlice.map(g => g.ownerId).filter(id => id);
                    if (ownerIdsToCheck.length > 0) {
                        // Busca eficiente na API apenas para os donos desta página
                        const fetchedMembers = await storeGuild.members.fetch({ user: ownerIdsToCheck });
                        fetchedMembers.forEach(m => ownersInStore.add(m.id));
                    }
                }
            } catch (err) {
                console.error('Erro ao verificar donos na loja (DevManage):', err);
            }
            // -------------------------------------------------------

            await interaction.editReply({
                components: generateDevGuildsMenu(allGuildData, 0, totals, 'default', ownersInStore),
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