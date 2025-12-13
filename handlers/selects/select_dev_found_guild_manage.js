// handlers/selects/select_dev_found_guild_manage.js
const db = require('../../database.js');
const generateGuildManageUI = require('../../ui/devPanel/devGuildManageMenu.js');

module.exports = {
    customId: 'select_dev_found_guild_manage',
    async execute(interaction) {
        const guildId = interaction.values[0];
        const guild = interaction.client.guilds.cache.get(guildId);

        if (!guild) {
            return interaction.update({ content: '❌ Guilda não encontrada (o bot pode ter saído).', components: [] });
        }

        try {
            const settings = await db.getGuildSettings(guildId);
            
            const guildData = {
                memberCount: guild.memberCount,
                ownerId: guild.ownerId,
                joinedAt: guild.joinedAt,
                ...settings
            };

            const payloadArray = generateGuildManageUI(guild, guildData);
            
            // IMPORTANTE: Extrai o objeto do array
            const payload = Array.isArray(payloadArray) ? payloadArray[0] : payloadArray;

            await interaction.update(payload);

        } catch (error) {
            console.error('Erro ao abrir gerenciador:', error);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ Erro ao carregar.', ephemeral: true });
            }
        }
    }
};