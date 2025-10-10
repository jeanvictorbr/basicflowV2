// Substitua o conteúdo em: handlers/modals/modal_dev_guild_edit_expiry.js
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
            return interaction.followUp({ content: 'Por favor, insira um número válido de dias.', ephemeral: true });
        }

        const interval = `${days} days`;
        
        // **CORREÇÃO:** Atualiza a data de expiração de TODAS as features ativas na tabela correta
        await db.query(
            `UPDATE guild_features 
             SET expires_at = expires_at + $1::interval 
             WHERE guild_id = $2 AND expires_at > NOW()`, 
            [interval, guildId]
        );
        
        const guild = interaction.client.guilds.cache.get(guildId);

        // Recarrega todas as informações para renderizar o menu atualizado
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0] || {};
        const featuresResult = await db.query('SELECT feature_key FROM guild_features WHERE guild_id = $1 AND expires_at > NOW()', [guildId]);
        const expiryResult = await db.query('SELECT MAX(expires_at) as expires_at FROM guild_features WHERE guild_id = $1 AND expires_at > NOW()', [guildId]);

        settings.enabled_features = featuresResult.rows.map(r => r.feature_key).join(',');
        settings.premium_expires_at = expiryResult.rows[0].expires_at;

        await interaction.editReply({
            components: generateDevGuildManageMenu(guild, settings),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};