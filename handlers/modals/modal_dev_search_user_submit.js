const generateResultsUI = require('../../ui/devPanel/devUserGuildsResult.js');

module.exports = {
    customId: 'modal_dev_search_user_submit',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.fields.getTextInputValue('target_user_id');
        const client = interaction.client;

        try {
            // Tenta buscar o usuário no cache global ou na API
            const targetUser = await client.users.fetch(userId).catch(() => null);

            if (!targetUser) {
                return interaction.editReply({ content: '❌ Usuário não encontrado ou ID inválido.' });
            }

            // Varredura de Guildas
            // Nota: Isso pode ser intensivo se o bot estiver em milhares de servidores.
            // Para bots gigantes, seria ideal usar sharding/broadcast, mas para single instance funciona bem.
            const sharedGuilds = [];

            // Vamos iterar sobre o cache de guildas
            for (const [guildId, guild] of client.guilds.cache) {
                try {
                    // Verifica cache primeiro para economizar API
                    if (guild.members.cache.has(userId)) {
                        sharedGuilds.push(guild);
                    } else {
                        // Se não estiver no cache, tentamos fetch (leve, apenas check)
                        const member = await guild.members.fetch(userId).catch(() => null);
                        if (member) {
                            sharedGuilds.push(guild);
                        }
                    }
                } catch (e) {
                    // Ignora erros de permissão ou acesso
                }
            }

            // Gera a UI com os resultados
            const payload = generateResultsUI(targetUser, sharedGuilds);
            await interaction.editReply(payload);

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao processar a busca.' });
        }
    }
};