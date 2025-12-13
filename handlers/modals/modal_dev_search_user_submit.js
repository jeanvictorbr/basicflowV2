// handlers/modals/modal_dev_search_user_submit.js
const generateResultsUI = require('../../ui/devPanel/devUserGuildsResult.js');

module.exports = {
    customId: 'modal_dev_search_user_submit',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.fields.getTextInputValue('target_user_id');
        const client = interaction.client;

        try {
            const targetUser = await client.users.fetch(userId).catch(() => null);

            if (!targetUser) {
                return interaction.editReply({ content: '❌ Usuário não encontrado.' });
            }

            const sharedGuilds = [];
            for (const [guildId, guild] of client.guilds.cache) {
                try {
                    if (guild.members.cache.has(userId)) {
                        sharedGuilds.push(guild);
                    } else {
                        // Check leve se não estiver no cache
                        const member = await guild.members.fetch(userId).catch(() => null);
                        if (member) sharedGuilds.push(guild);
                    }
                } catch (e) {}
            }

            // Gera UI V2
            const payloadArray = generateResultsUI(targetUser, sharedGuilds);
            
            // Extrai o objeto do array para o editReply
            const payload = Array.isArray(payloadArray) ? payloadArray[0] : payloadArray;

            await interaction.editReply(payload);

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Erro na busca.' });
        }
    }
};