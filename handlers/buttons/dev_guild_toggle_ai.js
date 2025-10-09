// Crie em: handlers/buttons/dev_guild_toggle_ai.js
const db = require('../../database.js');
const generateDevGuildManageMenu = require('../../ui/devPanel/devGuildManageMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_guild_toggle_ai_',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        const guildId = interaction.customId.split('_')[4];

        // Inverte o valor booleano da flag no banco de dados para a guild específica
        await db.query(
            `UPDATE guild_settings SET ai_services_disabled_by_dev = NOT COALESCE(ai_services_disabled_by_dev, false) WHERE guild_id = $1`,
            [guildId]
        );
        
        // Recarrega as informações e o menu para refletir a mudança
        const guild = interaction.client.guilds.cache.get(guildId);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0];

        await interaction.editReply({
            components: generateDevGuildManageMenu(guild, settings),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};