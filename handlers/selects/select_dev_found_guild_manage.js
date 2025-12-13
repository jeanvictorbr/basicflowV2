// handlers/selects/select_dev_found_guild_manage.js
const db = require('../../database.js');
const generateGuildManageUI = require('../../ui/devPanel/devGuildManageMenu.js');

module.exports = {
    customId: 'select_dev_found_guild_manage',
    async execute(interaction) {
        const guildId = interaction.values[0];
        const guild = interaction.client.guilds.cache.get(guildId);

        if (!guild) {
            // Se a guilda não existe mais, avisa e mantém a mensagem
            return interaction.reply({ content: '❌ Guilda não encontrada ou o bot foi removido.', ephemeral: true });
        }

        try {
            // 1. Atualiza a mensagem de busca para mostrar que foi selecionado
            // Isso evita que o usuário clique de novo e remove a lista
            await interaction.update({ 
                content: `✅ Selecionado: **${guild.name}**. Carregando painel abaixo...`,
                embeds: [], 
                components: [] 
            });

            // 2. Prepara os dados
            const settings = await db.getGuildSettings(guildId);
            const guildData = {
                memberCount: guild.memberCount,
                ownerId: guild.ownerId,
                joinedAt: guild.joinedAt,
                ...settings
            };

            // 3. Gera a UI V2 do Painel
            const payloadArray = generateGuildManageUI(guild, guildData);
            
            // Pega o objeto do array (formato V2)
            const payload = Array.isArray(payloadArray) ? payloadArray[0] : payloadArray;

            // 4. Envia como NOVA mensagem (FollowUp)
            // Isso permite usar Type 17 (Layouts Premium) sem dar erro de compatibilidade
            await interaction.followUp({ 
                ...payload, 
                ephemeral: true 
            });

        } catch (error) {
            console.error('[Dev Select] Erro:', error);
            // Se der erro no followUp, tenta avisar
            await interaction.followUp({ content: '❌ Erro ao carregar o painel da guilda.', ephemeral: true });
        }
    }
};