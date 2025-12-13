// handlers/modals/modal_dev_search_user_submit.js
const generateResultsUI = require('../../ui/devPanel/devUserGuildsResult.js');

module.exports = {
    customId: 'modal_dev_search_user_submit',
    async execute(interaction) {
        // Usa deferReply para ter até 15 minutos, mas será rápido agora
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.fields.getTextInputValue('target_user_id').trim();
        const client = interaction.client;

        try {
            // 1. Tenta identificar o usuário (API Check)
            let targetUser;
            try {
                targetUser = await client.users.fetch(userId);
            } catch (e) {
                return interaction.editReply({ content: '❌ Usuário não encontrado no Discord. Verifique o ID.' });
            }

            // 2. Busca Paralela Otimizada
            // Em vez de um loop 'for' lento, criamos uma array de promessas
            // O Discord.js gerencia o Rate Limit automaticamente se houver muitos requests
            const searchPromises = client.guilds.cache.map(async (guild) => {
                // Verificação 1: É o dono? (Instantâneo)
                if (guild.ownerId === userId) return guild;

                // Verificação 2: Está no cache? (Instantâneo)
                if (guild.members.cache.has(userId)) return guild;

                // Verificação 3: Request na API (Lento, mas necessário para "fantasmas")
                try {
                    // force: true ignora cache e vai no servidor do Discord
                    const member = await guild.members.fetch({ user: userId, force: true }).catch(() => null);
                    return member ? guild : null;
                } catch (e) {
                    return null;
                }
            });

            // Aguarda todas as buscas terminarem
            const results = await Promise.all(searchPromises);
            
            // Filtra os nulos (servidores onde não foi encontrado)
            const sharedGuilds = results.filter(guild => guild !== null);

            // 3. Gera a UI V2 com o resultado
            const payloadArray = generateResultsUI(targetUser, sharedGuilds);
            
            // Pega o objeto do array para enviar
            const payload = Array.isArray(payloadArray) ? payloadArray[0] : payloadArray;

            await interaction.editReply(payload);

        } catch (error) {
            console.error('[Dev Search] Erro:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro crítico durante a busca.' });
        }
    }
};