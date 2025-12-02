// handlers/buttons/dev_guilds_page.js
const devPanelUtils = require('../../utils/devPanelUtils.js');
// Importação segura com fallback para evitar quebras
const getAndPrepareGuildData = devPanelUtils?.getAndPrepareGuildData || (async (c) => ({ allGuildData: [], totals: {} }));
const generateDevGuildsMenu = require('../../ui/devPanel/devGuildsMenu.js');

const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;
const STORE_GUILD_ID = '1424757317701996544'; // ID da Loja
const ITEMS_PER_PAGE = 4;

module.exports = {
    customId: 'dev_guilds_page_',
    async execute(interaction) {
        try {
            // --- CORREÇÃO ROBUSTA DE PARSING ---
            // ID esperado: dev_guilds_page_NUMERO_SORTTYPE
            // Exemplo que pode estar falhando: dev_guilds_page_1 (sem sortType) ou dev_guilds_page__1 (double underscore)
            
            const parts = interaction.customId.split('_');
            
            // Encontra onde está a palavra 'page' no ID para usar de âncora
            const pageIndex = parts.indexOf('page');
            
            let page = -1;
            let sortType = 'default';

            // Tenta pegar o valor logo após 'page'
            if (pageIndex !== -1 && parts[pageIndex + 1]) {
                const potentialPage = parseInt(parts[pageIndex + 1]);
                if (!isNaN(potentialPage)) {
                    page = potentialPage;
                    // Se tiver mais um segmento depois do número, é o sortType
                    if (parts[pageIndex + 2]) sortType = parts[pageIndex + 2];
                }
            }

            // Fallback de emergência: Procura qualquer número na string se a lógica acima falhar
            if (page === -1) {
                const numPart = parts.find(p => !isNaN(parseInt(p)) && p.length < 5); // <5 para evitar IDs de guilda
                if (numPart) page = parseInt(numPart);
            }

            // Se ainda assim falhar, aborta com erro claro
            if (isNaN(page) || page < 0) {
                console.error('[DevPage Error] ID inválido recebido:', interaction.customId, parts);
                return interaction.reply({ 
                    components: [{type: 17, components: [{type: 10, content: '❌ **Erro de Navegação:** ID da página inválido.'}]}], 
                    flags: EPHEMERAL_FLAG | V2_FLAG 
                });
            }
            // -----------------------------------

            await interaction.deferUpdate();

            // 1. Carrega dados
            const { allGuildData, totals } = await getAndPrepareGuildData(interaction.client);

            // 2. Aplica Ordenação
            if (sortType === 'active') {
                allGuildData.sort((a, b) => b.totalInteractions - a.totalInteractions);
            } else if (sortType === 'inactive') {
                allGuildData.sort((a, b) => a.totalInteractions - b.totalInteractions);
            } else {
                // Default: Membros
                allGuildData.sort((a, b) => b.memberCount - a.memberCount);
            }

            // 3. Valida limites da página (para não quebrar se deletarem guildas)
            const totalPages = Math.ceil(allGuildData.length / ITEMS_PER_PAGE);
            const safePage = Math.max(0, Math.min(page, totalPages - 1));

            // 4. Verifica Clientes na Loja (Apenas para a página atual)
            const ownersInStore = new Set();
            try {
                const start = safePage * ITEMS_PER_PAGE;
                const end = start + ITEMS_PER_PAGE;
                const currentSlice = allGuildData.slice(start, end);
                
                const storeGuild = interaction.client.guilds.cache.get(STORE_GUILD_ID);
                if (storeGuild) {
                    const ownerIdsToCheck = currentSlice.map(g => g.ownerId).filter(id => id);
                    if (ownerIdsToCheck.length > 0) {
                        const fetchedMembers = await storeGuild.members.fetch({ user: ownerIdsToCheck });
                        fetchedMembers.forEach(m => ownersInStore.add(m.id));
                    }
                }
            } catch (e) { console.error('Erro check loja paginação:', e); }

            // 5. Renderiza
            await interaction.editReply({
                components: generateDevGuildsMenu(allGuildData, safePage, totals, sortType, ownersInStore),
                flags: V2_FLAG | EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error('Erro fatal em dev_guilds_page:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '❌ Erro interno ao mudar de página.', flags: EPHEMERAL_FLAG });
            }
        }
    }
};