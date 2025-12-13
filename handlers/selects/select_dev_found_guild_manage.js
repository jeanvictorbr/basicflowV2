// handlers/selects/select_dev_found_guild_manage.js
const db = require('../../database.js');
const generateGuildManageUI = require('../../ui/devPanel/devGuildManageMenu.js');

module.exports = {
    customId: 'select_dev_found_guild_manage',
    async execute(interaction) {
        // Importante: V2 geralmente usa update, não deferUpdate, para transições suaves
        // Mas se demorar, usamos deferUpdate. Vamos tentar direto.
        
        const guildId = interaction.values[0];
        const guild = interaction.client.guilds.cache.get(guildId);

        if (!guild) {
            return interaction.update({ content: '❌ Guilda não encontrada.', components: [] });
        }

        try {
            // Busca configurações
            const settings = await db.getGuildSettings(guildId);
            
            // Prepara dados compatíveis com o menu existente
            const guildData = {
                memberCount: guild.memberCount,
                ownerId: guild.ownerId,
                joinedAt: guild.joinedAt,
                ...settings
            };

            // Gera a UI usando o componente existente
            const payloadArray = generateGuildManageUI(guild, guildData);
            
            // [CORREÇÃO CRÍTICA]
            // A UI retorna um Array [{ type: 17 ... }]. 
            // O interaction.update espera O OBJETO, não o array.
            const payload = Array.isArray(payloadArray) ? payloadArray[0] : payloadArray;

            await interaction.update(payload);

        } catch (error) {
            console.error('Erro ao abrir gerenciador:', error);
            // Tenta recuperar com uma mensagem simples se falhar
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ Erro ao carregar o menu. Tente novamente.', ephemeral: true });
            }
        }
    }
};