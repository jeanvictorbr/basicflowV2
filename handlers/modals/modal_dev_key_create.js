// handlers/modals/modal_dev_key_create.js
const db = require('../../database.js');
const crypto = require('crypto');

module.exports = {
    customId: 'modal_dev_key_create_',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        const features = interaction.customId.split('_')[4];
        const duration = parseInt(interaction.fields.getTextInputValue('input_duration'), 10);
        const uses = parseInt(interaction.fields.getTextInputValue('input_uses'), 10);
        const comment = interaction.fields.getTextInputValue('input_comment');

        if (isNaN(duration) || isNaN(uses) || duration <= 0 || uses <= 0) {
            return interaction.editReply({ content: '❌ Duração e Usos devem ser números maiores que zero.' });
        }

        const key = `BF-${crypto.randomUUID().toUpperCase()}`;

        await db.query(
            `INSERT INTO activation_keys (key, duration_days, uses_left, grants_features, comment)
             VALUES ($1, $2, $3, $4, $5)`,
            [key, duration, uses, features, comment]
        );

        await interaction.editReply({ content: `✅ Chave criada com sucesso!\n\`\`\`${key}\`\`\`` });

        // Recarrega o menu de chaves para refletir a nova adição
        const manageKeysHandler = require('../buttons/dev_manage_keys.js');
        await manageKeysHandler.execute(interaction);
    }
};