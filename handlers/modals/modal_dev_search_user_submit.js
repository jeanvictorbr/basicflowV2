// handlers/modals/modal_dev_search_user_submit.js
const generateResultsUI = require('../../ui/devPanel/devUserGuildsResult.js');

module.exports = {
    customId: 'modal_dev_search_user_submit',
    async execute(interaction) {
        // Defer para evitar timeout
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.fields.getTextInputValue('target_user_id').trim();
        const client = interaction.client;

        try {
            // 1. Busca Usuário
            let targetUser;
            try {
                targetUser = await client.users.fetch(userId);
            } catch (e) {
                return interaction.editReply({ content: '❌ Usuário não encontrado no Discord. Verifique o ID.' });
            }

            // 2. Busca Otimizada (Paralela)
            const searchPromises = client.guilds.cache.map(async (guild) => {
                // Check rápido (Dono ou Cache)
                if (guild.ownerId === userId || guild.members.cache.has(userId)) return guild;

                // Check lento (API Force) - Só faz se não achou no rápido
                try {
                    const member = await guild.members.fetch({ user: userId, force: true }).catch(() => null);
                    return member ? guild : null;
                } catch (e) { return null; }
            });

            const results = await Promise.all(searchPromises);
            const sharedGuilds = results.filter(guild => guild !== null);

            // 3. Gera a UI
            const payload = generateResultsUI(targetUser, sharedGuilds);
            
            // Envia
            await interaction.editReply(payload);

        } catch (error) {
            console.error('[Dev Search] Erro:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro crítico durante a busca.' });
        }
    }
};