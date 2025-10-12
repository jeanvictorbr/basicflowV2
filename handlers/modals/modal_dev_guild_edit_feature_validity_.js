// Crie em: handlers/modals/modal_dev_guild_edit_feature_validity_.js
const db = require('../../database.js');
const generateDevGuildFeaturesMenu = require('../../ui/devPanel/devGuildFeaturesMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_dev_guild_edit_feature_validity_',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        const [, , , , , , guildId, featureKey] = interaction.customId.split('_');
        const days = parseInt(interaction.fields.getTextInputValue('input_days_validity'), 10);

        if (isNaN(days)) {
            return interaction.followUp({ content: 'Por favor, insira um número válido de dias.', ephemeral: true });
        }

        const interval = `${days} days`;
        
        await db.query(
            `UPDATE guild_features 
             SET expires_at = expires_at + $1::interval 
             WHERE guild_id = $2 AND feature_key = $3`, 
            [interval, guildId, featureKey]
        );
        
        const featuresResult = await db.query('SELECT feature_key, expires_at FROM guild_features WHERE guild_id = $1 AND expires_at > NOW()', [guildId]);
        
        await interaction.editReply({
            components: generateDevGuildFeaturesMenu(guildId, featuresResult.rows),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};