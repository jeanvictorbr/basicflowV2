// handlers/modals/modal_ativar_key.js
const db = require('../../database.js');

module.exports = {
    customId: 'modal_ativar_key',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const key = interaction.fields.getTextInputValue('input_key');

        const keyData = (await db.query('SELECT * FROM activation_keys WHERE key = $1', [key])).rows[0];

        if (!keyData || keyData.uses_left <= 0) {
            return interaction.editReply({ content: '❌ Chave de ativação inválida, expirada ou já utilizada.' });
        }

        const guildSettings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};

        const durationDays = keyData.duration_days;
        let expirationDate = guildSettings.premium_expires_at ? new Date(guildSettings.premium_expires_at) : new Date();
        
        if (expirationDate < new Date()) {
            expirationDate = new Date();
        }
        expirationDate.setDate(expirationDate.getDate() + durationDays);

        const existingFeatures = guildSettings.enabled_features ? guildSettings.enabled_features.split(',') : [];
        const newFeatures = keyData.grants_features ? keyData.grants_features.split(',') : [];
        const allFeatures = [...new Set([...existingFeatures, ...newFeatures].filter(Boolean))]; // .filter(Boolean) remove strings vazias
        
        await db.query(
            `INSERT INTO guild_settings (guild_id, enabled_features, premium_expires_at)
             VALUES ($1, $2, $3)
             ON CONFLICT (guild_id)
             DO UPDATE SET enabled_features = $2, premium_expires_at = $3`,
            [interaction.guild.id, allFeatures.join(','), expirationDate]
        );

        await db.query('UPDATE activation_keys SET uses_left = uses_left - 1 WHERE key = $1', [key]);

        await interaction.editReply({
            content: `✅ Licença ativada! As funcionalidades **[${newFeatures.join(', ')}]** foram adicionadas à sua assinatura, que agora é válida até **${expirationDate.toLocaleDateString('pt-BR')}**.`
        });
    }
};