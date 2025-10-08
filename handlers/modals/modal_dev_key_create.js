// handlers/modals/modal_dev_key_create.js
const db = require('../../database.js');
const crypto = require('crypto');
const generateDevKeysMenu = require('../../ui/devPanel/devKeysMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_dev_key_create_',
    async execute(interaction) {
        await interaction.deferUpdate(); 
        
        // CORREÇÃO: Decodifica os dados recebidos do ID customizado.
        const encodedFeatures = interaction.customId.split('_')[4];
        const features = Buffer.from(encodedFeatures, 'base64').toString('utf8');

        const duration = parseInt(interaction.fields.getTextInputValue('input_duration'), 10);
        const uses = parseInt(interaction.fields.getTextInputValue('input_uses'), 10);
        const comment = interaction.fields.getTextInputValue('input_comment');

        if (isNaN(duration) || isNaN(uses) || duration <= 0 || uses <= 0) {
            return interaction.followUp({ content: '❌ Duração e Usos devem ser números maiores que zero.', ephemeral: true });
        }

        const key = `BF-${crypto.randomUUID().toUpperCase()}`;

        await db.query(
            `INSERT INTO activation_keys (key, duration_days, uses_left, grants_features, comment)
             VALUES ($1, $2, $3, $4, $5)`,
            [key, duration, uses, features, comment]
        );

        const updatedKeys = (await db.query('SELECT * FROM activation_keys ORDER BY key ASC')).rows;
        await interaction.editReply({
            components: generateDevKeysMenu(updatedKeys, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });

        await interaction.followUp({ content: `✅ Chave criada com sucesso!\n\`\`\`${key}\`\`\``, ephemeral: true });
    }
};