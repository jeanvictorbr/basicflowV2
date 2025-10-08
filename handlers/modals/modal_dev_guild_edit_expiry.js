// handlers/modals/modal_dev_guild_edit_expiry.js
const db = require('../../database.js');
const generateDevGuildManageMenu = require('../../ui/devPanel/devGuildManageMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_dev_guild_edit_expiry_',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        const guildId = interaction.customId.split('_')[5];
        const days = parseInt(interaction.fields.getTextInputValue('input_days'), 10);

        if (isNaN(days)) {
            return interaction.followUp({ content: 'Por favor, insira um número válido.', ephemeral: true });
        }

        const currentSettings = (await db.query('SELECT premium_expires_at FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0];
        let expirationDate = currentSettings.premium_expires_at ? new Date(currentSettings.premium_expires_at) : new Date();
        if (expirationDate < new Date()) {
            expirationDate = new Date();
        }
        expirationDate.setDate(expirationDate.getDate() + days);

        await db.query('UPDATE guild_settings SET premium_expires_at = $1 WHERE guild_id = $2', [expirationDate, guildId]);
        
        const guild = interaction.client.guilds.cache.get(guildId);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0];

        await interaction.editReply({
            components: generateDevGuildManageMenu(guild, settings),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};