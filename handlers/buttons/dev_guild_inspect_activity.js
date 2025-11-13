// handlers/buttons/dev_guild_inspect_activity.js
// Este arquivo atua como um "atalho" que chama a lógica principal de analytics da guilda
const periodHandler = require('./dev_guild_analytics_period.js');

module.exports = {
    customId: 'dev_guild_inspect_activity_',
    async execute(interaction) {
        // O ID vem como: dev_guild_inspect_activity_GUILDID
        const guildId = interaction.customId.split('dev_guild_inspect_activity_')[1];
        
        // Forjamos o customId para simular o clique no botão de "7 dias"
        interaction.customId = `dev_guild_analytics_period_7d_${guildId}`;
        
        // Passamos a execução para o handler principal
        await periodHandler.execute(interaction);
    }
};