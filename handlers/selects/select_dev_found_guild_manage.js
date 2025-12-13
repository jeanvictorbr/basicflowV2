const db = require('../../database.js');
const generateGuildManageUI = require('../../ui/devPanel/devGuildManageMenu.js'); // Importa seu menu existente

module.exports = {
    customId: 'select_dev_found_guild_manage',
    async execute(interaction) {
        await interaction.deferUpdate();

        const guildId = interaction.values[0];
        const guild = interaction.client.guilds.cache.get(guildId);

        if (!guild) {
            return interaction.editReply({ content: '❌ A guilda não está mais acessível ou o bot foi removido.', components: [], embeds: [] });
        }

        try {
            // Busca dados do banco para preencher o menu corretamente
            const settings = await db.getGuildSettings(guildId);
            
            // Dados extras que o menu pode precisar
            const guildData = {
                memberCount: guild.memberCount,
                ownerId: guild.ownerId,
                joinedAt: guild.joinedAt,
                ...settings
            };

            // Gera a UI usando o componente que você JÁ TEM
            const payload = generateGuildManageUI(guild, guildData);
            
            await interaction.editReply(payload);

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Erro ao carregar o gerenciador da guilda.', components: [] });
        }
    }
};