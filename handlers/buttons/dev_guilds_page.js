// handlers/buttons/dev_guilds_page.js
const generateDevGuildsMenu = require('../../ui/devPanel/devGuildsMenu.js');

const ITEMS_PER_PAGE = 10;
const STORE_GUILD_ID = '1424757317701996544'; // ID DA SUA LOJA

module.exports = {
    customId: 'dev_guilds_page_', // ID dinâmico (termina com _)
    async execute(interaction) {
        // Extrai a página do ID (ex: dev_guilds_page_2)
        const parts = interaction.customId.split('_');
        const page = parseInt(parts[parts.length - 1]);

        if (isNaN(page)) return interaction.reply({ content: '❌ Página inválida.', ephemeral: true });

        await interaction.deferUpdate();

        // 1. Prepara a lista (mesma lógica de ordenação)
        const allGuilds = Array.from(interaction.client.guilds.cache.values())
            .sort((a, b) => b.memberCount - a.memberCount);

        const totalPages = Math.ceil(allGuilds.length / ITEMS_PER_PAGE);
        
        // Validação de limites
        const safePage = Math.max(0, Math.min(page, totalPages - 1));
        
        const start = safePage * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const currentGuilds = allGuilds.slice(start, end);

        // 2. LÓGICA NOVA: Verifica em lote quem está na loja
        const ownersInStore = new Set();
        try {
            const storeGuild = interaction.client.guilds.cache.get(STORE_GUILD_ID);
            if (storeGuild) {
                const ownerIdsToCheck = currentGuilds.map(g => g.ownerId);
                
                // Fetch eficiente apenas para os donos desta página
                const fetchedMembers = await storeGuild.members.fetch({ user: ownerIdsToCheck });
                
                fetchedMembers.forEach(m => ownersInStore.add(m.id));
            }
        } catch (error) {
            console.error("Erro ao verificar donos na loja (DevPanel Paginação):", error);
        }

        // 3. Gera a UI atualizada
        const payload = generateDevGuildsMenu(interaction, currentGuilds, safePage, totalPages, ownersInStore);
        
        await interaction.editReply(payload);
    }
};