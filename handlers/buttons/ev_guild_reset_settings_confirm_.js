// Crie em: handlers/buttons/dev_guild_reset_settings_confirm_.js
const db = require('../../database.js');
const generateDevGuildManageMenu = require('../../ui/devPanel/devGuildManageMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_guild_reset_settings_confirm_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const guildId = interaction.customId.split('_')[5];

        // Deleta as configurações da guilda
        await db.query('DELETE FROM guild_settings WHERE guild_id = $1', [guildId]);
        await db.query('DELETE FROM guild_features WHERE guild_id = $1', [guildId]);

        const guild = interaction.client.guilds.cache.get(guildId);
        
        await interaction.followUp({ content: `✅ Configurações para **${guild.name}** resetadas com sucesso.`, ephemeral: true });

        // Recarrega o menu de gerenciamento da guilda, agora zerado
        await interaction.editReply({
            components: generateDevGuildManageMenu(guild, {}),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};